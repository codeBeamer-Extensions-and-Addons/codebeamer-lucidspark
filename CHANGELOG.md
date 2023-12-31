# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

## Released

### [1.2.0]

#### Added

-  Relation & Association Visualization Button
   -  Creates lines between cards based on the relations and associations of the codebeamer items
   -  Once the button has been pressed all outgoing associations and downstream references will be found for each item in the current tracker, the relation will still be visualized if the target item is from another tracker
   -  The button displays the number of relations and associations that haven't been visualized yet.
   -  If all relations and associations have been visualized, the buttons tooltip is labeled with "Hide ..." and removes all visualized relations and associations in the current tracker from the board
   -  If there are more then 50 items in the current tracker on the board, the data will be fetched on demand to save resources and the buttons tooltip is labeled with "Toggle ..."

#### Changed

-  Fixed an issue where the Assisted query input was not used as the default query input
-  Fixed an issue where the Import all button count would be calculated incorrectly active filters existed
-  Fixed an issue where imported query result checkboxes wouldn't be checked
-  Fixed an issue where multiple items would be imported if there were a lot of items on the board
-  Shortened Import Action button texts and added tooltips

### [1.1.0]

#### Added

-  Sync Cards Button
   -  Syncs all cards on the lucidspark board by fetching the matching codebeamer items and updating the card content

#### Changed

-  Import All button
   -  count displays the number of items which have not been imported yet from that specific Tracker
   -  imports only those missing items to avoid duplicates
-  Item Import
   -  cards are spread out further depending on the number of items imported
-  UI Changes
   -  added padding to the top of the import modal
   -  Query Results
      -  Background of the query result turns #f5f5f5 (light grey) when hovered
      -  The whole query result is clickable now
      -  The cursor becomes a pointer when hovering over the query result
   -  CBQL Toggle button has been moved to the right side of the query input

### [1.0.0]

First version of the codebeamer-lucidspark plugin / MVP

#### Added

-  Import Modal
-  Connection to a Codebeamer instance
-  Project Selection
-  Tracker Selection
-  Assisted Item Query
-  CBQL Input Item Query
-  Settings Modal
   -  Project Selection
   -  Connection to a Codebeamer instance
-  Announcements page
-  Item Importing to the lucidspark board
-  Miro codebeamer-cards importer
