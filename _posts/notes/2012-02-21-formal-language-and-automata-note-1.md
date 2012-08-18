---
layout: post
title:  The Note of Formal Language and Automata (1)
category: note
published: true
home: no
meta:
  location: NJU
tags:
  - formal_language
  - the_theory_of_computation
---

Alphabets, Word, and Language

* A finite underlying set is called an alphabet
* A finite sequence of the elements of an alphabet is called a word
* A set of finite sequences (words) is called a language

Alphabets and Words

* An alphabet is a finitel, nonempty set of elements of the alphabet are usually call symbols or letters
* A word over an alphabet &Sigma; is a finite sequence of symbols from &Sigma;
* Empty word is denoted by &lambda;
* Universal set or universal language over &Sigma; is denoted by <math>&Sigma;^*</math>

Language and Operations

* <math>&Sigma;^*</math> is an infinite set while every word in <math>&Sigma;^*</math> is finite
* &lambda; is in <math>&Sigma;^*</math> and if x is in <math>&Sigma;^*</math> , then ax is in <math>&Sigma;^*</math> , for all a in &Sigma; 
* A language L over &Sigma;, <math>&Sigma;^*</math> &supe; L
* {&lambda;} is a language over every alphabet

<math>L^*</math> (reflexive transitive closure) and <math> L^+</math> (transitive closure) !important

* <math>L^+</math> = L<math>L^*</math> ? why ?

Language expression over &Sigma;

* For all alphabets &Sigma;, <math>&Sigma^*</math> is enumerable
* <math>E_&Sigma;</math> is enumerable
* <math>L_&Sigma;</math> is enumerable
* <math>L_&Sigma; &sub; 2^&Sigma;^*</math> 

DFA, A deterministic finite automaton, M = (Q, &Sigma;, &delta;, s, F)

* Q is an alphabet of state symbols
* &Sigma; is an alphabet of input symbols
* &delta; is a transition function : Q &times; &Sigma; -> Q
* s in Q is the start state
* F, Q &supe; F is a set of final states 

DFA initialization:

* x is placed on the input tape one symbol to a cell
* The reading head is positioned over the leftmost cell
* The current state is set to s
* The DFA is started

DFA configuration ~~~

PS: 上了第一节课，恶心到我了 >__< !!~~~

