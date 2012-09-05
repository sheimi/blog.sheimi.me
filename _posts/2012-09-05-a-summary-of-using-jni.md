---
layout: post
title: JNI 使用需要注意的地方
category: blog
meta:
  location: NJU
tags: [tech, study, java, jni]
  
---

虽然没有多少空余的时间，但是还是抽出了几节上课的时间尝试者使用了 Java 使用 JNI 调用 OpenCV。虽然 OpenCV 有一个 Java 的 Wrapper —— “JavaCV”，但是因为不是官方的版本，还是感觉不是那么可靠。

这篇文章主要是总结了我这次在使用 JNI 的时候遇到的一些问题。一些最基本的 JNI 的使用就不详细介绍了，可以参考前面的一篇文章：[第一次使用jni，把jni打包到jar中](http://blog.sheimi.me/blog/2012/02/22/jni-and-pack-jni-into-jar.html)

示例程序
-------

这个 Demo 只要使用 OpenCV 把图片转换成 BMP 格式。虽然 Java 也可以实现，但是这里我仅仅是纯粹想用 JNI 而已。

[Gist Repo](https://gist.github.com/3633452)

首先是 Java 的程序：

{% highlight java %}
// CVJNI.java
import java.io.*;

public class CVJNI {
  //Load jni library
  static {
    try {
      System.loadLibrary("cvjni");
    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  //native method
  public static native byte[] toBMP(byte[] imageSource);

  //main
  public static void main(String [] args) {
    String input = args[0];
    String output = args[1];

    FileInputStream fi = null;
    FileOutputStream fo = null;

    try {
      File infile = new File(args[0]);
      int len = (int)infile.length();
      //get source
      fi = new FileInputStream(infile);
      byte[] imageSource = new byte[len];
      fi.read(imageSource, 0, len);
      //revoke native method
      byte[] outImage = CVJNI.toBMP(imageSource);
      //write
      fo = new FileOutputStream(output);
      fo.write(outImage);
    } catch(IOException e) {
      e.printStackTrace();
    } finally {
      try {
        if (fi != null)
          fi.close();
        if (fo != null)
          fo.close();
      } catch(IOException e) {
        e.printStackTrace();
      }
    }
  }
}
{% endhighlight %}

然后是 C++ 的部分：
{% highlight cpp %}
//cvjni.cpp
#include "cvjni.h"
#include <opencv2/opencv.hpp>
#include <vector>
#include <iostream>

using namespace std;
using namespace cv;

/*
 * Class:     CVJNI
 * Method:    toBMP
 * Signature: ([B)[B
 */
JNIEXPORT jbyteArray JNICALL Java_CVJNI_toBMP (JNIEnv * env, jclass jc, jbyteArray jba) {
  cout << "This is in JNI" << endl;

  //convert jbyteArray to vector<char>
  unsigned char * isCopy;
  jbyte* jbae = env->GetByteArrayElements(jba, isCopy);
  jsize len = env->GetArrayLength(jba);
  char * imageSource = (char *)jbae;
  vector<char> imageSourceV;
  for (int i = 0; i < len; i++) {
    imageSourceV.push_back(imageSource[i]);
  }

  //convert format
  Mat image = imdecode(imageSourceV, CV_LOAD_IMAGE_COLOR);
  vector<unsigned char> imageDesV;
  imencode(".bmp", image, imageDesV); 

  //convert vector<char> to jbyteArray
  jbyte* result_e = new jbyte[imageDesV.size()];
  jbyteArray result = env->NewByteArray(imageDesV.size());
  for (int i = 0; i < imageDesV.size(); i++) {
    result_e[i] = (jbyte)imageDesV[i];
  }
  env->SetByteArrayRegion(result, 0, imageDesV.size(), result_e);
  return result;
}
{% endhighlight %}

最后是 Makefile：
{% highlight makefile %}
# Makefile
# FOR MAC
CC=g++
SEARCH_LIB=-lopencv_core -lopencv_highgui
INCLUDE=-I/usr/local/include -I$(JAVA_INCLUDE)
LIBRARY=-L/usr/local/lib
FLAGS= -m64 -dynamiclib -fPIC
OUT=libcvjni.jnilib
SRC=cvjni.cpp

mac:
  $(CC) $(FLAGS) $(LIBRARY) $(SEARCH_LIB) $(INCLUDE) $(SRC) -o $(OUT)

# FOR LINUX

CC=g++
CV_PATH=/usr/local/lib
SEARCH_LIB=$(CV_PATH)/libopencv_core.so $(CV_PATH)/libopencv_highgui.so
INCLUDE=-I/usr/local/include -I$(JAVA_INCLUDE) -I$(JAVA_INCLUDE)/linux
LIBRARY=-L/usr/local/lib
OUT=libcvjni.so
SRC=cvjni.cpp


FLAGS= -m64 -shared -fPIC
all:
  $(CC) $(FLAGS) $(SRC) $(SEARCH_LIB) -o $(OUT) $(INCLUDE) 

{% endhighlight %}


遇到的问题和解决方法
-----------------

### Mac 平台上需要注意的问题

在 Mac 平台上 g++ 其实使用的是 clang，在编译的时候，需要把 -shared 改为 -dynamiclib 然后把文件名改为 lib**.jnilib，否则 Mac 上的 Java 没有办法找到。

### Linux 上需要注意的问题

在 Linux 上不知道为什么，如果使用和 Mac 类似的命令的话，在生成的 shared object 中的依赖中没有办法找到相应的 opencv 的依赖。需要显示地把它地动态链接库放到命令里面，否则在运行的时候会提示找不到方法，也就是：

{% highlight bash %}
g++ -m64 -shared -fPIC cvjni.cpp /usr/local/lib/libopencv_core.so /usr/local/lib/libopencv_highgui.so -o libcvjni.so -I/usr/local/include -I/usr/lib/jvm/jdk1.6.0_35/include -I/usr/lib/jvm/jdk1.6.0_35/include/linux
{% endhighlight %}

不知道为什么 g++ 不再生成动态库的时候检查一下依赖关系呢。


### OpenJDK 的问题

OpenJDK 毕竟不是官方的 JDK 版本，在使用jni的时候，下面一句：
{% highlight java %}
  jbyteArray result = env->NewByteArray(imageDesV.size());
{% endhighlight %}
就会引起 jvm 的崩溃，当时使用的是 java-7-openjdk-amd64。当换成官方的 jdk1.6.0_35 是，jvm 就不会出错了。不知道是 OpenJDK 的问题，还是 OpenJDK Java 7 的问题。


总结
----

总的感觉是 JNI 真的不是那么好用，不像 Python 和 C 那么亲密无间，有个专门的包用来编译写的 C extension。还有就是以后能用 Oracle 的 JDK 就用它的，非官方版本的万一出了什么问题，自己都还不知道，到网上查也不一定能够查到想要的答案。


