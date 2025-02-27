# Could probably make this a json but multi line strings are not allowed
CHANGELOGS = [
{
    "version": "v1.5.2-beta (11/24/2021)",
    "updates": '''<ul>
                    <li>Redesigned the assignment graph layout</li>
                    <li>Renamed "Skew Ratio" to "Curvature"</li>
                    <li>Added due times</li>
                    <li>Added "Close Graph After Submitting Work Input" setting</li>
                    <li>Added "Allow Only one open Graph at a Time" setting</li>
                    <li>Added "Default Due Time" setting</li>
                    <li>Added "Restore Deleted Google Classroom" option to the settings</li>
                    <li>Removed being unable to open other assignments if other assignments are more urgent</li>
                    <li>Finished adding all the keybinds</li>
                    <li>Increased zoom on mobile</li>
                    <li>Dozens of minor UI improvements</li>
                    <li>Minor bug fixes</li>
                    <ul>
                        <li>Fixed soft due date incompatibility with break days</li>
                        <li>Fixed scrolling on Firefox not working</li>
                        <li>Fixed assignments not being marked as no more working days</li>
                        <li>Fixed default skew ratio not properly saving</li>
                        <li>Fixed NaN curvature</li>
                        <li>Fixed unbounded curvature</li>
                    </ul>
                </ul>''',
},
{
    "version": "v1.5.1-beta (11/7/2021)",
    "updates": '''<ul>
                    <li>Added soft due dates</li>
                    <li>Added "since" keyword to the work input</li>
                    <li>Added changelog alert updates</li>
                    <li>Added "assignment spacing" setting</li>
                    <li>Improved priority algorithm</li>
                    <li>Improved dynamic mode algorithm</li>
                    <li>Improved example account</li>
                    <li>Improved dark mode</li>
                    <li>Increased work input validation flexibility</li>
                    <li>Dozens of minor UI improvements</li>
                    <li>Minor bug fixes</li>
                    <ul>
                        <li>Fixed "Next Assignment" button sometimes not working</li>
                        <li>Fixed rare Google Classroom API errors</li>
                        <li>Fixed skew ratio not capping properly</li>
                        <li>Fixed submitting duplicate assignment tags</li>
                        <li>Fixed default minimum work time not showing up for Google Classroom assignments</li>
                        <li>Fixed incorrect Google Classroom assignment creation validation</li>
                    </ul>
                </ul>''',
},
{
    "version": "v1.5.0-beta (10/12/2021)",
    "updates": '''<ul>
                    <li>Major UI improvements</li>
                    <li>Added the ability to enter assignment fields later</li>
                    <li>Added more keybinds</li>
                    <li>Added "Important" and "Not Important" tags</li>
                    <li>Added "Sort Assignments in Reverse" setting</li>
                    <li>Added "Default Dropdown Tags" setting</li>
                    <li>Added "Dark Mode" setting</li>
                    <li>Styled the settings</li>
                    <li>Minor bug fixes</li>
                    <ul>
                        <li>Fixed rare dynamic mode crashes and bugs</li>
                        <li>Fixed Google Classroom API crashes and incorrect dates</li>
                        <li>Fixed work inputs incorrectly readjusting on edit assignment</li>
                        <li>Fixed "ignore minimum work time" inconsistencies</li>
                        <li>Fixed incorrect original form values</li>
                        <li>Fixed incorrect form validation errors</li>
                        <li>Fixed ignoring assignments bugs</li>
                        <li>Fixed midnight bugs</li>
                        <li>Fixed many other less relevant bugs</li>
                    </ul>
                </ul>''',
},
{
    "version": "v1.4.4-beta (8/12/2021)",
    "updates": '''<ul>
                    <li>Updated policies</li>
                    <li>Improved "ignore minimum work time ends" functionality</li>
                    <li>Improved "dynamic mode" functionality</li>
                    <li>Removed default autofill</li>
                    <li>Removed "not yet assigned" status icon</li>
                    <li>Removed "warning" status icon</li>
                    <li>Minor bug fixes</li>
                    <ul>
                        <li>Fixed Google Classroom API sometimes not enabling</li>
                        <li>Fixed alerts not showing up in the settings</li>
                        <li>Fixed custom cursors not working</li>
                        <li>Fixed "set skew ratio using graph" being unresponsive</li>
                        <li>Fixed small left tag position paddings</li>
                        <li>Fixed skew ratio arrow keys not holding</li>
                        <li>Fixed assignments instantly completing</li>
                        <li>Fixed assignment descriptions not resizing on re-enter</li>
                        <li>Fixed hidden logo on mobile</li>
                    </ul>
                </ul>''',
},
{
    "version": "v1.4.3-beta (7/27/2021)",
    "updates": '''<ul>
                    <li>Improved the assignment form UI</li>
                    <li>Restyled alerts</li>
                    <li>Improved delete assignment transition</li>
                    <li>Added "tag position" setting</li>
                    <li>Minor bug fixes</li>
                    <ul>
                        <li>Fixed deleting tags from Google Classroom assignments crashing the page</li>
                        <li>Fixed the example assignment not updating its dates</li>
                        <li>Fixed long assignments crashing the page</li>
                        <li>Fixed unexpected line wrappers</li>
                        <li>Fixed early assignment dates not showing up on re-enter</li>
                        <li>Fixed timezone issues</li>
                    </ul>
                </ul>''',
},
{
    "version": "v1.4.2-beta (7/19/2021)",
    "updates": '''<ul>
                    <li>Improved Google Classroom API loading speeds</li>
                    <li>Added "delete assignments from class" shortcut</li>
                    <li>Added assignment descriptions</li>
                    <li>Minor bug fixes</li>
                    <ul>
                        <li>Fixed "fixed mode" crashing the graph</li>
                        <li>Fixed being unable to edit the first assignment</li>
                        <li>Fixed Safari issues</li>
                        <li>Fixed double login</li>
                        <li>Fixed adding wrong Google Classroom tags</li>
                    </ul>
                </ul>''',
},
{
    "version": "v1.4.1-beta (7/12/2021)",
    "updates": '''<ul>
                    <li>Improved Google Classroom API loading speeds</li>
                    <li>Clamped long assignment names</li>
                    <li>Polished tabbing</li>
                    <li>Minor bug fixes</li>
                    <ul>
                        <li>Fixed incorrect "default skew ratio" values in settings</li>
                        <li>Fixed "enable tutorial" not working in settings</li>
                        <li>Fixed assignments having excess height</li>
                        <li>Fixed cancelling setting the skew ratio using graph not working</li>
                        <li>Fixed the red line rarely disconnecting with the blue line</li>
                        <li>Fixed unexpected behavior with "ignore minimum work time ends"</li>
                        <li>Fixed tags sometimes not deleting</li>
                    </ul>
                </ul>''',
},
{
    "version": "v1.4.0-beta (7/8/2021)",
    "updates": '''<ul>
                    <li>Implemented Google Classroom API</li>
                    <li>Replaced "Advanced" with icons</li>
                    <li>Fixed timezone issues</li>
                    <li>Improved loading speeds</li>
                </ul>''',
},
{
    "version": "v1.3.3-beta (7/1/2021)",
    "updates": '''<ul>
                    <li>Made tags draggable to allow resorting</li>
                    <li>Synced the example account's assignments' dates with today</li>
                    <li>Minor bug fixes</li>
                    <ul>
                        <li>Fixed "show progress bar" crashing the graph</li>
                        <li>Fixed original field values not showing on edit assignment</li>
                        <li>Fixed the assignment form forcing you to scroll up</li>
                        <li>Fixed the assignment form sometimes not fully being on screen</li>
                        <li>Fixed assignments sometimes not opening</li>
                        <li>Fixed briefly being able to see unsorted assignments on reload</li>
                        <li>Fixed background images resetting when the settings is saved</li>
                    </ul>
                </ul>''',
},
{
    "version": "v1.3.2-beta (6/28/2021)",
    "updates": '''<ul>
                    <li>Made info buttons hoverable</li>
                    <li>Changed assignment header button icons</li>
                    <li>Improved the delete assignment transition</li>
                    <li>Added shift + arrow key keybinds</li>
                    <li>Minor bug fixes</li>
                    <ul>
                        <li>Fixed the graph crashing for small window heights</li>
                        <li>Fixed the existing up and down keybinds not changing the skew ratio</li>
                        <li>Fixed assignments sometimes not opening</li>
                        <li>Fixed assignments overlaying the tag add box</li>
                    </ul>
                </ul>''',
},
{
    "version": "v1.3.1-beta (6/26/2021)",
    "updates": '''<ul>
                    <li>Completely rewrote a large portion of code</li>
                    <li>Added shortcut line wrappers around their assignments</li>
                    <li>Moved "re-enable tutorial" to the settings</li>
                    <li>Minor bug fixes</li>
                    <ul>
                        <li>Fixed marginless text</li>
                        <li>Fixed scrolling past the assignment form overlay</li>
                        <li>Fixed assignments obscuring the tag box</li>
                        <li>Fixed assignments phasing into "delete all starred assignments"</li>
                    </ul>
                </ul>''',
},
{
    "version": "v1.3.0-beta (6/23/2021)",
    "updates": '''<ul>
                    <li>Added assignment tags</li>
                </ul>''',
},
{
    "version": "v1.2.2-beta (6/16/2021)",
    "updates": '''<ul>
                    <li>Added custom background images</li>
                    <li>Removed delete assignment queue</li>
                    <li>Minor bug fixes</li>
                    <ul>
                        <li>Fixed sorting issues</li>
                        <li>Fixed assignments sometimes becoming unclickable</li>
                        <li>Fixed "delete all starred assignments" sometimes disappearing</li>
                    </ul>
                </ul>''',
},
{
    "version": "v1.2.1-beta (6/7/2021)",
    "updates": '''<ul>
                    <li>Reworked the assignment sorting algorithm</li>
                    <li>Removed "in progress"</li>
                    <li>Added "Hour" as a unit of time</li>
                    <li>Minor bug fixes</li>
                    <ul>
                        <li>Fixed rarely displaying incorrect assignment dates</li>
                        <li>Fixed "(Invalid Date)" shown as the estimated time to completion</li>
                        <li>Fixed assignments with break days finishing too early</li>
                        <li>Fixed "delete finished assignments" not doing anything</li>
                        <li>Fixed "re-enable tutorial"</li>
                    </ul>
                </ul>'''
},
{
    "version": "v1.2.0-beta (5/29/2021)",
    "updates": '''<ul>
                    <li>Slightly adjusted favicon</li>
                    <li>Added full device support for favicons and PWAs</li>
                    <li>Removed "show info button" setting</li>
                    <li>Removed "show past work inputs" setting</li>
                    <li>Added "default unit of work to minute" setting</li>
                    <li>Added "autofill work done" shortcut</li>
                    <li>Minor bug fixes</li>
                    <ul>
                        <li>Fixed linear assignments not behaving linearly</li>
                        <li>Fixed the graph rarely not completing an assignment at the due date</li>
                        <li>Fixed shortcuts sometimes not showing up</li>
                    </ul>
                    <li>Removed Herobrine</li>
                </ul>''',
},
{
    "version": "v1.1.11-beta (5/22/2021)",
    "updates": '''<ul>
                    <li>Added highest and lowest custom priority colors in the settings</li>
                    <li>Added a reset button to the settings</li>
                    <li>Added a shortcut to delete all starred assignments</li>
                    <li>Added "Autofill All Work Done" to advanced</li>
                    <li>Increased sort timeout</li>
                    <li>Minor bug fixes</li>
                    <ul>
                        <li>Fixed "fin" not working</li>
                        <li>Fixed going to the next day bugging assignments in progress</li>
                        <li>Fixed set skew ratio in graph rarely crashing</li>
                        <li>Fixed linear assignments messing up the red line</li>
                        <li>Fixed NaN priority</li>
                    </ul>
                </ul>''',
},
{
    "version": "v1.1.10-beta (5/20/2021)",
    "updates": '''<ul>
                    <li>Implemented a system to ensure users fully complete their assignments, even if their due dates pass</li>
                    <li>Removed skew ratio sort timeout</li>
                    <li>Minor bug fixes</li>
                    <ul>
                        <li>Fixed minimum work time rarely not working</li>
                        <li>Fixed the graph being blank for assignments with a due date before today</li>
                    </ul>
                </ul>''',
},
{
    "version": "v1.1.9-beta (5/19/2021)",
    "updates": '''<ul>
                    <li>Rewrote tutorial alert text</li>
                    <li>Minor bug fixes</li>
                    <ul>
                        <li>Fixed outline not showing on graph buttons</li>
                        <li>Fixed invisible ghost assignments when deleting them too quickly</li>
                        <li>Fixed info buttons sometimes being invisible</li>
                        <li>Fixed incorrect priority values for assignments due tomorrow</li>
                        <li>Fixed the example assignment sometimes crashing the page</li>
                        <li>Fixed editing assignments unintentionally removing work inputs</li>
                    </ul>
                </ul>''',
},
{
    "version": "v1.1.8-beta (5/18/2021)",
    "updates": '''<ul>
                    <li>Added a label for advanced buttons on the graph footer</li>
                    <li>Rearranged graph footer buttons</li>
                    <li>Changed "Enter total units done" to "Enter units done"</li>
                    <li>Minor bug fixes</li>
                    <ul>
                        <li>Fixed resorting after creating an assignment glitching out</li>
                        <li>Fixed the example assignment initially being visible on first login</li>
                        <li>Fixed displaying the wrong date after midnight</li>
                        <li>Fixed assignments not being saved after the page is quickly closed</li>
                    </ul>
                </ul>''',
},
{
    "version": "v1.1.7-beta (5/17/2021)",
    "updates": '''<ul>
                    <li>Added example account to login page</li>
                    <li>Removed unnecessary graph text</li>
                    <li>Completely refactored a lot of code</li>
                    <li>Minor bug fixes</li>
                    <ul>
                        <li>Fixed showing incorrect break days on edit assignment</li>
                        <li>Fixed deleting all finished assignments only visually deleting them locally</li>
                    </ul>
                </ul>''',
},
{
    "version": "v1.1.6-beta (5/13/2021)",
    "updates": '''<ul>
                    <li>Added status icon images</li>
                    <li>Repositioned status icons</li>
                </ul>''',
},
{
    "version": "v1.1.5-beta (5/13/2021)",
    "updates": '''<ul>
                    <li>Changed edit icon</li>
                    <li>Changed delete icon</li>
                    <li>Changed discord icon</li>
                    <li>Minor bug fix</li>
                    <ul>
                        <li>Fixed resorting during another resort messing up the swapping algorithm</li>
                    </ul>
                </ul>''',
},
{
    "version": "v1.1.4-beta (5/12/2021)",
    "updates": '''<ul>
                    <li>Enabling round to multiples of 5 minutes automatically changes every assignment appropriately</li>
                    <li>Increased sort timeout to avoid assignments resorting too fast</li>
                    <li>Automatically create an example assignment in the tutorial</li>
                    <li>Minor bug fixes</li>
                    <ul>
                        <li>Fixed an overflow error for longer due dates</li>
                        <li>Fixed the graph disappearing after re-entering the due date</li>
                        <li>Fixed work inputs not cutting off from a re-entered due date</li>
                    </ul>
                </ul>''',
},
{
    "version": "v1.1.3-beta (5/11/2021)",
    "updates": '''<ul>
                    <li>Added "Go to Next Day" in advanced</li>
                    <li>Added shift + click delete icon keybind to skip the prompt for deleting an assignment</li>
                    <li>Minor bug fix</li>
                    <ul>
                        <li>Fixed assignments assigned after midnight causing unexpected behavior</li>
                    </ul>
                </ul>''',
},
{
    "version": "v1.1.2-beta (5/11/2021)",
    "updates": '''<ul>
                    <li>Made assignments unclickable if an assignment without past work inputs or no working days is present to force users to resolve the issue</li>
                    <li>Minor bug fixes</li>
                    <ul>
                        <li>Fixed advanced controls and account dropdown initially being visible</li>
                        <li>Fixed changing the break days for one assignment applying to every assignment</li>
                    </ul>
                </ul>''',
},
{
    "version": "v1.1.1-beta (5/10/2021)",
    "updates": '''<ul>
                    <li>Marked all other assignments as completed when an assignment without past work inputs is present to urge users to enter their progress</li>
                    <li>Marked all other assignments as completed when an assignment with no working days is present to urge users to re-enter its break days</li>
                    <li>Lowered opacity for assignments marked as completed</li>
                    <li>Improved Form UI</li>
                    <li>Fixed edit assignment not doing anything</li>
                    <li>Fixed internal errors</li>
                    <li>Minor bug fixes</li>
                    <ul>
                        <li>Fixed edit assignment causing form to disappear</li>
                        <li>Fixed the displayed date on the graph unexpectedly changing</li>
                        <li>Fixed scaling constants not updating on browser resize</li>
                    </ul>
                </ul>''',
},
{
    "version": "v1.1.0-beta (5/8/2021)",
    "updates": '''<ul>
                    <li>Added "mark assignment as completed" button below the graph</li>
                    <li>Improved Form UI</li>
                    <li>Minor bug fixes</li>
                    <ul>
                        <li>Fixed issue with assignments being marked as completed at midnight</li>
                        <li>Fixed graph not updating after being autofilled from changing the skew ratio</li>
                    </ul>
                </ul>''',
},
{
    "version": "v1.0.3-beta (5/7/2021)",
    "updates": '''<ul>
                    <li>Removed excessive caching</li>
                    <li>Minor bug fixes</li>
                    <ul>
                        <li>Fixed delete work input messing up the new start of the red line</li>
                        <li>Fixed NaN priority</li>
                        <li>Fixed assignments not saving if page is closed too fast</li>
                        <li>Fixed incorrect login scroller image positioning on mobile</li>
                        <li><a href="https://www.youtube.com/watch?v=oHg5SJYRHA0">Rosho was here</a></li>
                    </ul>
                </ul>''',
},
{
    "version": "v1.0.2-beta (5/6/2021)",
    "updates": '''<ul>
                    <li>Allowed assignments to be open during swaps</li>
                    <li>Minor bug fixes</li>
                    <ul>
                        <li>Fixed dynamic mode sometimes not working</li>
                        <li>Decreased swap duration</li>
                        <li>Changed expired discord link on login screen</li>
                    </ul>
                </ul>''',
},
{
    "version": "v1.0.1-beta (5/3/2021)",
    "updates": '''<ul>
                    <li>Updated scroller image</li>
                    <li>Colored assignments without past work inputs white</li>
                    <li>Minor bug fixes</li>
                    <ul>
                        <li>Fixed units to complete at a time not working when unit is minute</li>
                        <li>Fixed new assignment animation not working on Firefox</li>
                        <li>Fixed new assignments scrolling too far down</li>
                        <li>Fixed assignments assigned in the future coloring pink</li>    
                    </ul>
                </ul>''',
},
{
    "version": "v1.0.0-beta (5/3/2021)",
    "updates": '''<ul>
                    <li>Official beta release! :D</li>
                </ul>''',
},
]