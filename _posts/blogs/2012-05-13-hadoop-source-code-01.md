---
layout: post
title: 源代码阅读笔记（1） --- nutch 的结构
category: blog
published: true
meta:
  location: NJU
tags:
  - hadoop
  - study
  - source_code
  - architecture
  - nutch
---

第三学期的有一门课“软件系统设计与体系结构”，课上的大作业是设计和实现一个搜索引擎，老师说可以并鼓励复用，并且告诉了我们两个可以使用的开源软件 [lucene](http://lucene.apache.org/core/) 和 [nutch](https://nutch.apache.org/) 。于是，在复习GRE之余便稍微看了一下这几个软件。

历史
---

在这几个开源软件中 lucene 应该算是最年长的了，它是一个由 Java 实现的全文搜索引擎的库，有许多著名网站的搜索都是基于这个库实现的，可是它仅仅是一个库，并不是一个搜索引擎。

然后nutch就出现了，nutch 这个项目虽然比 lucene 年轻，但是在我看来，有着神奇的经历。当时这个项目刚开始的时候，设计者想要完成一个类似于 Google 的网络搜索引擎。实现一个网络搜索引擎和普通的搜索引擎不一样，它首先需要实现一个爬虫，从网络上爬取网页等资源，存在本地。然后需要对这些资源建立索引。当用户查询的时候，对用户的 Query 进行解析，然后查询。

nutch 在开始设计的时候是基于 lucene 建立索引的，实现了一个网络爬虫，还有一个简单的查询界面。可是在实现的时候，遇到了一些问题。大量的网络页面如何简单地储存在本地计算机集群中，还有如何更好地利用计算机集群更加好，快速地进行索引的建立和页面的爬取。就在这时候，Google 发布了两篇论文，GFS 和 MapReduce。仿照 Google 的 GFS 和 MapReduce，Nutch 的一个子项目 Hadoop 就这么诞生了。后来 Apache 又有了 [Solr](http://lucene.apache.org/solr/)（一个基于lucene的全文搜索引擎），于是 Nutch 把其中的 web 搜索的部分也砍去了。现在的Nutch，包含一个网络爬虫以及一个索引建立的部分，它的索引的建立不依赖与 lucene 了，而是自己实现了一个类似与 lucene 的机制，然后把建好的索引提交到 solr 中，Query 的工作就完全交给 Solr 来做了。而它的网络爬虫和索引的建立都用 MapReduce 实现的。

上面也说了，[hadoop](http://hadoop.apache.org/) 本来是 nutch 的一个子项目，可是现在越来越流行了，也早就成为了 Apache 的顶级项目。Hadoop 由三个部分组成 common，HDFS 和 MapReduce。Common 中为 HDFS 和 MapReduce 提供了一些通用的支持，如 RPC，本地文件系统的封装，一些通信的接口等。HDFS 是一个分布式的文件系统，MapReduce 是一个分布式计算的框架。

作业
----

再说说作业，作业中要我们基于 nutch 的爬虫可以做到3台及其的并发，能够把爬下来的数据分布式地储存到各台计算集中。可是对于 nutch 来说，如果使用 hadoop 模式的话，这些问题便可以轻松解决，配置一下 hadoop，然后把 hadoop 的配置文件放到 nutch 中就可以了。

问了一下老师，老师说使用已有的实现没有问题，可是在完成开始的一些设计的时候，需要详细了解一下它们的架构。于是就想要自己稍微看一下这些东西的源码，了解一下他们的架构。

废话不说了，就先从 nutch 开始吧.

nutch的结构
----------

话说网上关于 nutch 的资料还真少呀，文档也少得可怜，不过看了一下 nutch 的代码组织，还算是比较容易看的。

nutch 最外面有12个包，其中比较重要的有共有以下几个包：

+   crawl
+   fetcher
+   indexer
+   parser
+   plugin
+   scoring

除了 crawl 之外，其他基本上一个包实现了一个步骤

crawl 中包括了程序的入口和一些初始化的信息，爬虫数据库，连接数据库和索引数据库的实现，fetcher是分布抓取网页的包，indexer 是分布式建立索引的，paser 是解析用的，plugin 是nutch插件的接口，nutch 所有的扩展都是通过 plugin 实现的，scoring 是对文档评分的机制。

crawl 中 crawl.java 是程序的入口。分析了 Crawl 也就可以基本了解 nutch 的工作机制了

{% highlight java %}
Injector injector = new Injector(getConf());
Generator generator = new Generator(getConf());
Fetcher fetcher = new Fetcher(getConf());
ParseSegment parseSegment = new ParseSegment(getConf());
CrawlDb crawlDbTool = new CrawlDb(getConf());
LinkDb linkDbTool = new LinkDb(getConf());

injector.inject(crawlDb, rootUrlDir);
int i;
for (i = 0; i < depth; i++) {             // generate new segment
  Path[] segs = generator.generate(crawlDb, segments, -1, topN, System
                         .currentTimeMillis());
  if (segs == null) {
    LOG.info("Stopping at depth=" + i + " - no more URLs to fetch.");
    break;
  }
  fetcher.fetch(segs[0], threads);  // fetch it
  if (!Fetcher.isParsing(job)) {
    parseSegment.parse(segs[0]);    // parse it, if needed
  }
  crawlDbTool.update(crawlDb, segs, true, true); // update crawldb
}

{% endhighlight %}

从上面一段代码中可以看出，nutch 是首先初始化了 Injector, Generator, Fetcher, ParseSegment 四个 MapReduce 程序。然后先运行 Injector，然后在一个 For 循环中迭代运行 Generator， Fetcher, ParseSegment, 在每一次迭代最后都对爬取的数据库进行了更新。

{% highlight java %}
linkDbTool.invert(linkDb, segments, true, true, false); // invert links

if (solrUrl != null) {
  // index, dedup & merge
  FileStatus[] fstats = fs.listStatus(segments, HadoopFSUtil.getPassDirectoriesFilter(fs));
  SolrIndexer indexer = new SolrIndexer(getConf());
  indexer.indexSolr(solrUrl, crawlDb, linkDb,
    Arrays.asList(HadoopFSUtil.getPaths(fstats)));
  SolrDeleteDuplicates dedup = new SolrDeleteDuplicates();
  dedup.setConf(getConf());
  dedup.dedup(solrUrl);
}
{% endhighlight %}

然后又建立了链接的数据库。如果指定了solr的Url的位置，建立索引。索引是通过 SolrIndexer 建立的，也是通过 MapReduce 实现的，最后把生成的索引发送到 Solr 中。

值得一提的是，nutch 对文件系统的操作使用的是 hadoop 的 FileSystem 接口，这个接口把文件系统给封装了起来，只要通过修改配置文件就可以决定 nutch 使用的是本地文件系统，还是一个 HDFS 这样的分布式文件系统。

今天就写到这里啦，To be Continued ~~~~
