# Tetris
**Rational for Creating a Tetris Clone**

I had recently been through an introduction to HTML, CSS, and Javascript. I wanted to apply some of the priciples learned in CS50x and my Coding Bootcamp to making a web app using Javascript. I spent quite a lot of time thinking about a project that would help me apply and expand what I learned. One of the potential projects that came up was Tetris. Both my wife and I were children in the 1980s and had fond memories of playing Tetris. We were both excited by the idea. She placed an additional request on the project...that it be playable on her phone and tablet. As a result, I also needed to learn about and apply responsive design.

**Video Overview of the Project:** ![CS50x Final Project - Tetris] (https://www.youtube.com/watch?v=fLQtxcprqZQ)

**Project Deployed Using ![GitHub Pages] (https://jacoleman1978.github.io/tetris/)**

**Devices that can be used**

This game was designed to be reponsive to the screen area of the browser it is being played in. It will adapt in size to the screen area used, as well as landscape vs. portrait orientation. The buttons are large enough to be used on phones and other touch screens, while keyboard controls are easier to use for non touch screens.

**What is Tetris?**

Tetris is a game where shapes fall down the game grid. Each of the shapes are made up of four square blocks arranged in different ways. The shapes can be moved left or right as well as rotated while they are falling. Once a shape touches the bottom of the play area or any part of the shape lands on top of another shape, it is stuck and a new shape begins to fall. The goal of the game is to use the shapes to complete as many lines horizontally across the board as you can before your stack reaches the top of the screen. Completed lines disappear and all lines above will shift down to take its place. The level increases every 10 lines that are completed. An increase in level increases the point values of completed lines as well as increases the drop rate of the shape.

**Game Controls**

*The shapes can be moves left or right using the corresponding arrow buttons on the screen or the arrow keys on a keyboard.
*The shapes can be rotated clockwise or counter-clockwise using the "F" and "D" keys, respectively, or by using the corresponding buttons on the screen.

**Scoring in this version of Tetris**

*Points for 1 completed line: 100 + 5 / level

*Points for 2 completed lines: 220 + 10 / level

*Points for 3 completed lines: 360 + 15 / level

*Points for 4 completed lines (tetris): 520 + 20 / level

Your highest score will be saved in your browser, so you can keep trying to improve your score.

![Screen Shot 2021-11-15 at 8 36 07 PM](https://user-images.githubusercontent.com/85963154/141885952-0f53b0db-c438-4623-85b3-d9fa5b801fb9.png)

![Screen Shot 2021-11-15 at 8 36 58 PM](https://user-images.githubusercontent.com/85963154/141888133-a7031f8f-0ef7-4997-a220-febb8a6ef303.png)


**File Contents**

Initially when I wrote app.js, I used functions, but I found that it was much easier to create classes and use an OOP paradigm. Classes allowed for inheritance of common attributes and methods, but also allowed for polymorphisms, modifying the child classes as needed. Additionally it encapsulated the data into nice groups to make it easier to troubleshoot. Classes were also a nice abstraction. Once I created the shapes using classes, it was straightforward to use them as if they were a black box.

Looking back on the code in app.js, I would have split the code into separate JavaScript files in order to have a separation of concerns. app.js is over 700 lines long with multiple classes and functions defined. The logic involved in rotating the objects and line completion was more complicated than I initially thought it would be. It would have been easier to write, read and debug had the file been split into smaller ones. Moving forward, I will take this lesson to heart.

The index.html file has minimal contents. Much of what is displayed on the screen was easier to implement using JavaScript. The file does include the static text in the statistics banner located above the play area. It also contains the text used in the three modals used: pause, instruction, and gameOver.

No CSS Frameworks were used. All of the basic CSS was written in styles.css and modified in JavaScript as needed. Initially the flexbox was used to make the game grid, however when the screen was resized the number of squares in a row changed. As a result flexgrid was used and easily fixed that issue, also making it easier to scale responsively to the screen area.
