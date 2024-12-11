# CMPM-121-Phaser-Valley

Fork with functioning Web Version: [JC's Fork](https://github.com/jzara3115/CMPM-121-Phaser-Valley)

## Table of Contents
- [Devlog F.3](#Devlog-Entry-F.3---12/8/2024)
- [Devlog F.2](#Devlog-Entry-F.2---12/8/2024)
- [Devlog F.1](#Devlog-Entry-F.1---12/6/2024)
- [Devlog F.0](#Devlog-Entry-F.0---12/3/2024)
- [Devlog Team](#Devlog-Entry---11/13/2024)

## Devlog Entry F.3 - 12/8/2024

### Requirements

- [F0.a - F0.g]
    - Same as last entry
- [F1.a - F1.d]
    - Same as last entry
- [F2.a - F2.c]
    - Same as last entry
- Game Internationalized
    - Each translatable string is referenced by a key, and the LanguageManager fetches the appropriate translation based on the current language setting. When adding support for a new language, developers just need to add the translation.js for the new language to the loacales folder and add a new else if statement in LanguageManager.
- Localized And Support Three Different Written Languages
    - Our game supports three languages: English, Arabic, and Chinese. English is the primary language of the development team. For Arabic, which is the right-to-left script, we use Deepl to assist with translations. For Chinese, a logographic script, this is my native language, so I translated it by myself. To change the language in the game, players can do that by selecting the language buttons that are available on the main menu. These buttons are labeled with the respective language names. 
- Installable on a Smartphone-class Mobile Device
    - Using Phaser 3 as our game engine, the easiest way to make it work on a mobile device is by implementing a PWA. This is primarily done in JavaScript and involves using a service worker to cache necessary source code files and assets. The manifest.json file enables the PWA functionality, making the application installable on both desktop and mobile devices. During this process, we also include screenshots and an app logo to meet the requirements. Additionally, we implement game screen scaling and joystick control for the mobile version.
- The game launches and runs even when the device is not connected to the internet
    - By utilizing manifest.json and file caching, we make it possible to play the game offline once it is fully loaded (i.e., cached) on the mobile device.

### Reflection

Well, we managed to get F.3 finished.  We didn't manage to complete the conversion from Javascript to Typescript, but pretty much everythign else is functional.  In regards to our roles, we mostly kept to them - our tools lead did eventually set up Deno for the repository, our Design Lead made and translated the game, our other Design Lead handled mobile and offline development... and our Engine Lead failed at one of his two jobs.  The design didn't change much, but that's because it started as minimal as possible, and we were still behind every step of the way.  If everyone was working from the start, maybe we'd have had room to innovate, but as it stands there just wasn't any time.

We initially didn't anticipate that the game would be ported to mobile phones. As a result, we did not allocate or design adequate space for the placement of touch controls, impacting its current usability on these devices. In the end, we must have a floating joystick over the content to make touch control functional.


## Devlog Entry F.2 - 12/8/2024

### Requirements

- Character Moves on 2d Grid  
    - Same as last entry  
- Time Advances Manually  
    - Same as last entry  
- Proximity-Based Reaping and Sowing  
    - Same as last entry  
- Grid Cells Have Sun And Water Levels  
    - Same as last entry  
- Each Plant Has Both a Type and a Growth Level  
    - Same as last entry  
- Plant Growth is Governed by Simple Spatial Rules  
    - Small change the on the plant growth conditions
- Scenario is Completed When Some Condition is Satisfied  
    - Same as last entry  
- Cell Information is Stored as an Array of Structs or a Struct of Arrays  
    - Same as last entry
- Multiple Save Files and Autosaving  
    - Same as last entry
- Auto-save system
    -  Same as last entry
- Infinite Undos and Redos  
    - Same as last entry
- External DSL for scenario designs(YAML)
    - The external DSL defines key components like the grid config, win conditions, plant info, player position, and land color. The grid config defines how many rows and columns the grid will have, as well as the size of each cell. The win conditions specify how many money the player need to earn. Plant include information on plant type, sowing price, selling price, growing conditions, and maximum number of growth times. Player positions determines the starting position of the player at the beginning of the game. Lastly, landColor, the color of the cell

    **Scenario File**
```
GridConfig:
    Width: 5
    Height: 5
    Size: 100

winCondition: 100

plant:
    - type: none
      cost: 0
      price: 0
      sunNeed: 0
      waterNeed: 0
      maxGrowth: 0
    - type: mushroom
      cost: 1
      price: 5
      sunNeed: 1
      waterNeed: 2
      maxGrowth: 2
    - type: grass
      cost: 5
      price: 12
      sunNeed: 1
      waterNeed: 1
      maxGrowth: 2
    - type: pumpkin
      cost: 20
      price: 45
      sunNeed: 5
      waterNeed: 8
      maxGrowth: 2

playerPosition:
    x: 0
    y: 0

landColor: 0x926829
```
- Internal DSL for plant types and growth conditions
    - Not implemented.
- Switch to an alternate platform
    - We did not manage to successfully switch platforms.  That being said, the work put in to attempt to switch is available in branch 'convertToTS' - much of the code would have been able to be carried over with minor tweaking, and we attempted to move the saving and loading functions and scenes into their own file.  This would have required some adjustments - arranging to have the save/load screens pass a SaveData object (consisting of the current game state, the undo and redo stacks, and a grid size) to the Play scene instead of telling the Play scene to relevant actions, as it does now.  The main issue was the additional limitations on using code from one script file in another script - even if I had both the Play and Save scenes have copies of the saving functions (Play needs it for autosaves), we're using js-yaml for the external DSL.  Importing it causes errors at runtime, not importing it causes errors in the IDE. 

### Reflection

We have encountered problems with importing and exporting files in typescript when switching platforms.  As we don't have much time remaining to finish this project, we were forced to abandon platform switching.

Engine Lead note: I'll be honest.  I have little to no experience dealing with manual intra-module function transfer, and as far as I can tell that's what the errors I'm getting are trying to do.  Worst of all, I've yet to find information on the internet that doesn't tell me to do what I'm doing - you know, the thing that doesn't work.

## Devlog Entry F.1 - 12/6/2024

### Requirements

- Character Moves on 2d Grid  
    - Same as last week  
- Time Advances Manually  
    - Same as last week  
- Proximity-Based Reaping and Sowing  
    - Same as last week  
- Grid Cells Have Sun And Water Levels  
    - Same as last week  
- Each Plant Has Both a Type and a Growth Level  
    - Same as last week  
- Plant Growth is Governed by Simple Spatial Rules  
    - Same as last week  
- Scenario is Completed When Some Condition is Satisfied  
    - Same as last week  
- Cell Information is Stored as an Array of Structs or a Struct of Arrays  
    -  Our grid cell information is stored as an array of structs using ArrayBuffers, following the format depicted below.  

```mermaid
packet-beta
title Game State Buffer
0-3: "Player Position"
4-5: "Money"
6-7: "Days"
8-57: "Grid cells, each cell is 2 bytes"
```
- - Each cell is represented by a 2 byte integer from 0000 to 10532, organized as follows - the thousands digit represents the cell's water level (0-10), the hundreds digit represents the cell's light level (0-5), the tens digit represents the index of the plant in the cell (0-3), and the ones digit represents the growth stage of the plant (0-2).  A 0 in the tens place is interpreted as the absence of a plant.
- Multiple Save Files and Autosaving  
    - The game maintains three save files and one autosave in local storage.  The save files are manually saved to using the save button, while the autosave updates upon starting the game and whenever the time is advanced.  Upon starting the game, the player is able to select a save file to start from - if the save file has data it will be loaded, otherwise the default start will be loaded.  The player may also manually load a save file at any point prior to finishing the game.
- Auto-save system
    -  The autosave updates upon starting the game and whenever the time is advanced. The player can select the Autosave file in the loading menu, to continue where the player left off.
- Infinite Undos and Redos  
    - Undos and Redos are implemented as a pair of stacks.  Sowing and reaping plants and advancing time add a snapshot of the game state to the undo stack in the form of an ArrayBuffer as depicted above.  Pressing the undo button moves the top of the undo stack to the redo stack and loads the game state from the new top of the undo stack.  Pressing the redo button moves the top of the redo stack to the undo stack, then loads from the new top of the undo stack as before.  Adding a new snapshot to the undo stack by any means other than the redo button clears the redo stack.  


### Reflection

There were no significant changes to our plans from last Devlog, save that our Tools Lead JC finally set up deno on the repository.  Hasn't exactly been a lot of time to end up changing plans otherwise - Typescript remains the most viable change option in terms of engines.


## Devlog Entry F.0 - 12/3/2024

### Requirements

- Controlled Character Moves Across a 2d Grid

    - The game occurs on a 5*5 2D Grid. Arrays are used to store all values related to a given cell.
The player can move between cells using the arrow keys, which adjusts the character's coordinates by one in the relevant direction, 
then moves the character sprite by the length of one cell.

- Time Advances Manually

    - There is a button onscreen that advances time for all the cells, updating them based on rules explained below.  Time does not pass while the player is walking around.  

- Proximity-Based Reaping and Sowing

    - Player can select on the nearby cell and sow a new plant or reap a fully grown plant. If no cell is selected, it will sow a new plant or reap on the player cell. 

- Grid Cells Have Sun And Water Levels

    - Each cell has both a sun level and a water level, displayed as an integer value.  When the "Next Day" button is clicked, the sun levels of each cell is randomized between 0 and 5.  Additionally, each cell gains between 0 and 3 water level per turn, and loses 2 water level if it has both at least 1 sun and a plant of growth stage 0 (just planted) or 1 (partially grown).  

- Each Plant Has Both a Type and a Growth Level

    - There are three kinds of plants - mushrooms, grass, and pumpkins.  Each plant has three stages of growth, and a different value when reaped, which can only be done when the plant is fully grown.  

- Plant Growth is Governed by Simple Spatial Rules

    - When the player clicks the "next day" button, if a cell has a plant that is not fully grown, and the cell has at least 1 sun and 2 water, then the plant's growth stage increases by 1 (changing the plant's sprite) and the water level of the cell decreases by 2.

- Scenario is Completed When Some Condition is Satisfied

    - The objective of the game is earn money.  The player starts with $10, and must sow different plants, wait for them to grow, and harvest them for money. Upon reaching $100, the player has completed the scenario. 

### Reflection

We determined that Tiled was not necessary to our project, so we have decided to cut it from the project.  In addition, Haorong has been promoted to Design Lead, as Erik has been MIA for the past few weeks.  


## Devlog Entry - 11/13/2024
### Introducing the Team

- Erik Lu / kami-lel: Design Backup Lead

- Haorong Rong / hrong1: Design Lead

- Ian Wallace / 14N-W4774c3: Engine Lead

- Jc Zaragoza / Jzara3115: Tools Lead

### Tools and Materials

We intend to use the Phaser3 framework, as we're all familiar with it and it provides some simple options for changing engines partway through the assignment.  

We will start out working in JavaScript. We all took CMPM 120, so this is nothing new. This allows us to focus on making the game within the remaining time in the course.  

We expect to be using Tiled for some graphical assets and Visual Studio for coding. Again, these are things we're all familiar with, so we can focus on swapping over and making the game instead of getting distracted learning new tools. We may also make use of some open source assets, to minimize the time spent on non-coding tasks.  

We will be swapping to Phaser3 / TypeScript. Some members of the group expressed a dislike of Javascript, so we decided to swap away from it rather than swapping to it.  

### Outlook

For the most part, we're looking to focus on learning how to handle transitioning from one engine to another, with minimal focus on the added difficulty of learning new tools, frameworks, or languages. We're not taking any particular additional risks or challenges - those are good ways to miss deadlines, and we're in the holiday season.
