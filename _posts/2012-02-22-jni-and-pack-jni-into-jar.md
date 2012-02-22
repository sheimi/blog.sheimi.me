---
layout: post
title:  第一次使用jni，把jni打包到jar中 
category: blog
tags:
  - tech
  - study
---

{{ page.title }}
================

<p class="meta">22 Feb 2012 - At School</p>

好长时间没有碰java了，因为不太喜欢java冗长的语法。但是java依然是工业界的一朵奇葩，我们的一个项目也不得不用到它。由于我们需要用到jni，并且要把jni打包道jar中，于是我今天首次尝试了一下jni的使用。Mark 一下，防止以后忘掉。

Hello JNI
---------

一开始写的还算比较简单。

{% highlight java %}
//Here is HelloJNI.java
public class HelloJNI {
  static {
    try {
      System.loadLibrary("hellojni");
    } catch (Excption e) {     // I am a little indolent
      e.printStackTrace();
    }
  }

  public static native String showMessage(String msg);

  public static void main(String [] args) {
    String msg = Test.showMessage("Hello JNI");
    System.out.println("Here is in Java");
    System.out.println(msg);
  }
}
{% endhighlight %}

* 编译java文件  javac HelloJNI.java
* 产生C头文件   javah -jni -o hellojni.h HelloJNI
* 新建hellojni.c 实现这个接口

{% highlight c %}
//Here is hellojni.c

#include "stdio.h"
#include "hellojni.h"

NJIEXPORT jstring JNICALL
Java_HelloJNI_showMessage(JNIEnv * env, jclass classObject, jstring valueObject) {
  fprintf(stdout, "Here is C output\n");
  return valueObject;
}
{% endhighlight %}

然后把hellojni.h编译成为动态库   
gcc -m32 -shared -fPIC hellojni.c -o libhellojni.so -I$JAVA_HOME/include -IJAVA_HOME/include/linux

一开始运行的时候总是报错，需要把环境变量改一下   export LD_LIBRARY_PATH=.:$LD_LIBRARY_PATH

把.so文件打包到jar中
-------------------

查了一些方法，其中一个我比较喜欢，再load动态库的时候，把so文件复制到tmp目录下，然后删掉

{% highlight java %}
//modify the static block

static {
  try {
    Class c = HelloJNI.class;
    URL location = 
      c.getProtectionDomain().getCodeSource().getLocation();
    ZipFile zf = new ZipFile(location.getPath());
    // libhellojni.so is put in the lib folder
    InputStream in = zf.getinputStream(zf.getEntry("lib/libhellojni.so"));
    File f = File.createTempFile("JNI-", "Temp");
    FileOutputStream out = new FileOutputStream(f);
    byte [] buf = new byte[1024];
    int len;
    while ((len = in.read(buf)) > 0)
      out.write(buf, 0, len);
    in.close();
    out.close();
    System.load(f.getAbsolutePath());
    f.delete();
  } catch (Exception e) { // I am still lazy ~~~
    e.printStackTrace();
  }
}

{% endhighlight %}

That's all ~~~ 



