---
layout: post
title: 软件架构复习笔记
category: blog
published: false
meta:
  location: NJU 
tags: [architecture, review，note]
---

1. 名词解释
----------


### 设计的5个准则

+   准则1：用“美”的方式实现功能，是设计的价值
+   准则2：设计的复杂度 = 事物复杂度 + 载体与事物的适配复杂度
+   准则3：设计重在内部结构，而不是外在表现
+   准则4：只有高层设计良好，底层设计才能良好
    +   The better early design, the easier detailed design will be
    +   高层设计的质量要到最底层才能准确验证
    +   层次间是迭代而非瀑布，线性关系
    +   不要在完成高层设计之后再进行底层设计
    +   要尽早有可验证的原型
+   准则5：只有写完并测试代码之后，才能算是完成了设计

### 4+1 View

+   Logic View: 
    +   the object model of the design (when an oo design method is used)
    +   system is decomposed into a set of key abstractions, taken objects or object classes
    +   {Component, connector, configuration}
    +   viewer: End-users
    +   considers: functional requirements(what the system should provide in terms of services to its users)
+   Process View: 
    +   to capture the concurrency and synchronization aspects of the design
    +   process: a grouping of tasks that form an executable unit
    +   viewer: Integrators
    +   considers: non-functional requirements(cocurrency, performance, scalability)
    +   multiple level of abstractions, a logical network of processes at the highest level
+   Development View: 
    +   basis of a line of product, subsystem decomposition
    +   to describe the static organization of the software in its development environment
    +   represented by module and subsystem diagrams
    +   viewer: Programmers and Software Managers
    +   considers: software module organization(Hierarchy of layers, software management, reuse, constraints of tools)
+   Physical View: to describe the mapping of the software onto the hardware and reflects its distributed aspect
    +   mapping the software to the hardware
    +   Topology and Communication
    +   viewer: System Engineers
    +   considers: Non-functional req. regarding to underlying hardware (avalibility, reliability(fault-tolerance), performance(throughput) and scalability)
+   Scenarios
    +   put it all together
    +   viewer: all users of other views and evaluators
    +   consider: system consistency, validity
    +   help architect during the architecture design
    +   help illustrate and validate the document

### OO 协作与协作设计（理解）

#### What's Collaboration  
  
> The objects within a program must collaborate;
> otherwise, the program would consist of only one 
> big object that dose everything.

An application can be broken down into a set of many different behaviors. Each such behavior is implemented by a distinct collaboration between the objects of the application

*Every collaboration, no matter how small or large, always implements a behavior of the application*

Imagine an object-oriented application as a network of objects connected by relationships. Collaborations are the patterns of messages that play through that network in puersuit of a particular behavior. The collaboration is distributed across the network of objects, and so does not exist in any one place

#### Collaboration Design

Identify collaboration:

+   system behavior from use-case
+   from software architecture design(Module interface and Process communication)

Design collaboration(of system behaviors: control structures):

+   two ways: *Dispersed* and *Centralized*
    +   Dispersed: Logics of a system behavior is spread widely through the objects network
    +   Centralized: One extra controller record all logics of a system behavior
+   Control Styles: *Dispersed*, *Centralized*, *Delegated*
    +   Centralized:Easy to find where the decision are made


Design collaboration(of system behaviors: control structures)

### OO 职责与职责分配

### GRASP 模式（或其中之一）（理解）

GRASP, General Responsibility Assignment Software Pattern.


2. 软件设计的审美标准
------------------

### 审美标准是什么

+   简洁性：模块化和信息隐藏
+   一致性（概念完整性）：体系结构的风格
+   坚固性（高质量）：最重要的是体现在体系结构上，设计模式所要解决的问题

### 列举已知的设计方法与技术（至少5中），他们促进了那些审美标准的达成

如，模块化对简洁性，结构一致性，质量影响，设计模式，信息隐藏


3. 设计的层次性
-------------

### 高层设计、中层设计和底层设计各自的出发点、主要关注因素（即那些审美要素）、主要方法与技术和最终制品


4. 软件体系结构的风格
------------------

要求：

+   描述或比较相关的风格
+   对给定场景判断需要使用的风格


5. 职责分配与设计协作
------------------

要求:

+   协作设计（控制风格）的比较和场景判定
+   对给定场景和要求的控制风格，根据GRASP模式判定职责的分配
+   根据分析类图和体系结构模块接口，建立基本设计类图


6. 设计模式
----------

### 重点，设计模式部分所有的思考题（2题）

### 普通 Programming to Interface 有哪些手段？集合类型 PTI 有那些手段

### OCP 有那些手段（提示：不只是继承）

### 一个模块的信息隐藏有哪两种基本类型，各自有哪些处理手段？

### 实现共性与可变性有哪些手段？ 对给定的场景，给出共性与可变性的设计方案，将继承和聚合搞好

### 在解决De-Coupling时，常常使用哪些Indirection的手段？对给定场景给出Indirection的解决方案

### MVC与分层方式的区别（要具体到实现）

### 对象的创建有哪些常见的解决方法（hint：这里要求常见解决方法，不是设计模式）


