// THIS FILE HAS NOT YET BEEN FULLY DOCUMENTED

// There is a deadlock netween autotuneSkewRatio and setDynamicStartInDynamicMode:
// When dynamic start is set, skew ratio needs to be re-autotuned
// But when skew ratio is re-autotuned, it may mess up dynamic start
// This variable is the number of iterations setDynamicStartInDynamicMode and autotuneSkewRatio should be run
const AUTOTUNE_ITERATIONS = 4;

class Assignment {
    constructor(dom_assignment) {
        this.sa = utils.loadAssignmentData(dom_assignment);
        if (!this.sa.needs_more_info) {
            this.red_line_start_x = this.sa.fixed_mode ? 0 : this.sa.dynamic_start; // X-coordinate of the start of the red line
            this.red_line_start_y = this.sa.fixed_mode ? 0 : this.sa.works[this.red_line_start_x - this.sa.blue_line_start]; // Y-coordinate of the start of the red line
            this.min_work_time_funct_round = this.sa.min_work_time ? Math.ceil(this.sa.min_work_time / this.sa.funct_round) * this.sa.funct_round : this.sa.funct_round; // LCM of min_work_time and funct_round
            this.assign_day_of_week = this.sa.assignment_date.getDay();
            this.unit_is_of_time = ["minute", "hour"].includes(pluralize(this.sa.unit, 1).toLowerCase());
        }
    }
    calcSkewRatioBound() {
        let x1 = this.sa.complete_x;
        let y1 = this.sa.y;
        if (this.sa.break_days.length) {
            const mods = this.calcModDays();
            x1 -= Math.floor(this.sa.x / 7) * this.sa.break_days.length + mods[this.sa.x % 7];
        }
        if (!y1) return 0;
        /*
        skew_ratio = (a + b) * x1 / y1; 
        skew_ratio = this.funct(1) * x1 / y1;
        skew_ratio = (y1+min_work_time_funct_round) * x1 / y1;
        */
        const skew_ratio_bound = mathUtils.precisionRound((y1 + this.min_work_time_funct_round) * x1 / y1, 10);
        return skew_ratio_bound;
    }
    setDynamicStartIfInDynamicMode() {
        if (this.sa.fixed_mode) return;
        const len_works = this.sa.works.length - 1;

        let low = this.sa.blue_line_start;
        let high = len_works + this.sa.blue_line_start;// - (len_works + this.sa.blue_line_start === this.sa.x); // If users enter a value >y on the last day dont change dynamic start because the graph may display info for the day after the due date; however this doesn't happen because the assignment is completed
        while (low < high) {
            const mid = Math.floor((low + high) / 2);
            this.red_line_start_x = mid;
            this.red_line_start_y = this.sa.works[this.red_line_start_x - this.sa.blue_line_start];
            this.setParabolaValues();

            let valid_red_line_start_x = true;
            // The inner for loop checks if every work input is the same as the red line for all work inputs greater than red_line_start_x
            let next_funct = this.funct(this.red_line_start_x),
                next_work = this.sa.works[this.red_line_start_x - this.sa.blue_line_start];
            for (let i = this.red_line_start_x; i < len_works + this.sa.blue_line_start; i++) {
                const this_funct = next_funct,
                    this_work = next_work;
                next_funct = this.funct(i + 1),
                next_work = this.sa.works[i - this.sa.blue_line_start + 1];
                if (next_funct - this_funct !== next_work - this_work) {
                    valid_red_line_start_x = false;
                    break;
                }
            }
            if (valid_red_line_start_x) {
                high = mid;
            } else {
                low = mid + 1;
            }
        }
        this.red_line_start_x = low;
        this.red_line_start_y = this.sa.works[this.red_line_start_x - this.sa.blue_line_start];
        this.sa.dynamic_start = this.red_line_start_x;
        this.setParabolaValues();
    }
    // make sure to properly set red_line_start_x before running this function
    incrementDueDate() {
        this.sa.due_time = {hour: 0, minute: 0};
        do {
            this.sa.x++;
        } while (this.getWorkingDaysRemaining({ reference: "blue line end" }) === 0);
        this.sa.complete_x = this.sa.x;
        ajaxUtils.sendAttributeAjaxWithTimeout("due_time", this.sa.due_time, this.sa.id);

        const due_date = new Date(this.sa.assignment_date.valueOf());
        due_date.setDate(due_date.getDate() + this.sa.x);
        ajaxUtils.sendAttributeAjaxWithTimeout("x", due_date.getTime()/1000, this.sa.id);
    }
    getWorkingDaysRemaining(params={reference: null}) {
        const original_red_line_start_x = this.red_line_start_x;
        if (params.reference === "today") {
            let today_minus_assignment_date = mathUtils.daysBetweenTwoDates(date_now, this.sa.assignment_date);
            this.red_line_start_x = today_minus_assignment_date;
        } else if (params.reference === "blue line end") {
            let len_works = this.sa.works.length - 1;
            this.red_line_start_x = this.sa.blue_line_start + len_works;
        }
        let x1 = this.sa.x - this.red_line_start_x;
        if (this.sa.break_days.length) {
            const mods = this.calcModDays();
            x1 -= Math.floor(x1 / 7) * this.sa.break_days.length + mods[x1 % 7];
        }
        this.red_line_start_x = original_red_line_start_x;
        return x1;
    }
}
class VisualAssignment extends Assignment {
    static CLOSE_ASSIGNMENT_TRANSITION_DURATION = 750 * SETTINGS.animation_speed
    static MOUSE_POSITION_TRANSFORM = {x: 0.1, y: -1.3} // Adjusts the mouse position by a few pixels to make it visually more accurate
    static RED_LINE_COLOR = {r: 233, g: 68, b: 46}
    static BLUE_LINE_COLOR = {r: 1, g: 147, b: 255}
    static DRAW_POINT_COLOR = {r: 0, g: 255, b: 0}
    static SKEW_RATIO_ROUND_PRECISION = 3
    static SKEW_RATIO_SNAP_DIFF = 0.05
    static ARROW_KEYDOWN_THRESHOLD = 500
    static ARROW_KEYDOWN_INTERVAL = 13
    static BUTTON_ERROR_DISPLAY_TIME = 1000
    static TOTAL_ARROW_SKEW_RATIO_STEPS = 100

    constructor(dom_assignment) {
        super(dom_assignment);
        this.dom_assignment = dom_assignment;
        this.graph = dom_assignment.find(".graph");
        this.fixed_graph = dom_assignment.find(".fixed-graph");
        this.set_skew_ratio_using_graph = false;
        this.draw_mouse_point = true;
        this.complete_due_date = new Date(this.sa.assignment_date.valueOf());
        this.complete_due_date.setDate(this.complete_due_date.getDate() + Math.floor(this.sa.complete_x));
        if (this.sa.due_time && (this.sa.due_time.hour || this.sa.due_time.minute)) {
            this.complete_due_date.setMinutes(this.complete_due_date.getMinutes() + this.sa.due_time.hour * 60 + this.sa.due_time.minute);
        }
        if (this.sa.assignment_date.getFullYear() === this.complete_due_date.getFullYear()) {
            this.date_string_options = {month: 'long', day: 'numeric', weekday: 'long'};
            this.date_string_options_no_weekday = {month: 'long', day: 'numeric'};
        } else {
            this.date_string_options = {year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'};
            this.date_string_options_no_weekday = {year: 'numeric', month: 'long', day: 'numeric'};
        }
        this.scale = window.devicePixelRatio || 2;
    }
    resize() {
        if (!this.sa.fixed_mode) {
            // Use sa because dynamic_start is changed in priority.js; needed to redefine starts
            this.red_line_start_x = this.sa.dynamic_start;
            this.red_line_start_y = this.sa.works[this.red_line_start_x - this.sa.blue_line_start];
            this.setParabolaValues();
        }
        this.scale = window.devicePixelRatio || 2; // Zoom in/out
        const assignment_footer = this.dom_assignment.find(".assignment-footer");
        if (assignment_footer.is(":visible")) {
            this.width = this.fixed_graph.width();
            this.height = this.fixed_graph.height();
        } else {
            assignment_footer.show();
            this.width = this.fixed_graph.width();
            this.height = this.fixed_graph.height();
            assignment_footer.hide();
        }
        //hard
        if (this.width > 500) {
            VisualAssignment.font_size = 13.9;
        } else {
            VisualAssignment.font_size = Math.round((this.width + 450) / 47 * 0.6875);
        }
        this.wCon = (this.width - 55) / this.sa.complete_x;
        this.hCon = (this.height - 55) / this.sa.y;
        this.graph[0].width = this.width * this.scale;
        this.graph[0].height = this.height * this.scale;
        this.fixed_graph[0].width = this.width * this.scale;
        this.fixed_graph[0].height = this.height * this.scale;
        if (this.dom_assignment.hasClass("open-assignment") && this.dom_assignment.is(":visible")) {
            this.drawFixed();
            this.draw();
        }
    }
    mousemove(e, iteration_number=1) {
        const raw_x = e.pageX - this.fixed_graph.offset().left;
        const raw_y = e.pageY - this.fixed_graph.offset().top;
        // If set skew ratio is enabled, make the third point (x2,y2)
        if (this.set_skew_ratio_using_graph && iteration_number !== AUTOTUNE_ITERATIONS + 1) {
            let x1 = this.sa.complete_x - this.red_line_start_x;
            let y1 = this.sa.y - this.red_line_start_y;
            if (this.sa.break_days.length) {
                const mods = this.calcModDays();
                x1 -= Math.floor((this.sa.x - this.red_line_start_x) / 7) * this.sa.break_days.length + mods[(this.sa.x - this.red_line_start_x) % 7];
            }
            // (x2,y2) are the raw coordinates of the graoh
            // This converts the raw coordinates to graph coordinates, which match the steps on the x and y axes
            let x2 = (raw_x - (50 + VisualAssignment.MOUSE_POSITION_TRANSFORM.x)) / this.wCon - this.red_line_start_x;
            let y2 = (this.height - raw_y - (50 + VisualAssignment.MOUSE_POSITION_TRANSFORM.y)) / this.hCon - this.red_line_start_y;
            // Handles break days
            if (this.sa.break_days.length) {
                const floorx2 = Math.floor(x2);
                if (this.sa.break_days.includes((this.assign_day_of_week + floorx2 + this.red_line_start_x) % 7)) {
                    x2 = floorx2;
                }
                const mods = this.calcModDays();
                x2 -= Math.floor(x2 / 7) * this.sa.break_days.length + mods[floorx2 % 7];
            }
            const skew_ratio_bound = this.calcSkewRatioBound();
            // If the mouse is outside the graph to the left or right, ignore it
            // x2 can be NaN from being outside of the graph caused by negative indexing by floorx2. Doesn't matter if this happens
            if (0 < x2 && x2 < x1) {
                // If the parabola is being set by the graph, connect (0,0), (x1,y1), (x2,y2)
                const parabola = this.calcAandBfromOriginAndTwoPoints([x2, y2], [x1, y1]);
                this.a = parabola.a;
                this.b = parabola.b;
                
                // Redefine skew ratio
                this.sa.skew_ratio = mathUtils.clamp(2 - skew_ratio_bound, (this.a + this.b) * x1 / y1, skew_ratio_bound);
                if (Math.abs(Math.round(this.sa.skew_ratio) - this.sa.skew_ratio) < VisualAssignment.SKEW_RATIO_SNAP_DIFF) {
                    // Snap skew ratio to whole numbers
                    this.sa.skew_ratio = Math.round(this.sa.skew_ratio);
                }
            } else if (0 >= x2) {
                this.sa.skew_ratio = skew_ratio_bound;
            } else if (x2 >= x1) {
                this.sa.skew_ratio = 2 - skew_ratio_bound;
            }
            this.setDynamicStartIfInDynamicMode();
            this.mousemove(e, iteration_number + 1);
        } else {
            // Passes mouse x and y coords so mouse point can be drawn
            this.draw(raw_x, raw_y);
        }
    }
    arrowSkewRatio() {
        /**
         * Line: y = ax + b
         * y1 = y - this.red_line_start_y
         * x1 = (complete_x - this.red_line_start_x)
         * y = x(y1/x1)
         * inverse:
         * y = y1-x(y1/x1)
         * inverse it:
         * 
         * Parabola: y = ax^2 + bx
         * y = ax^2 + bx
         * 
         * Solve for x:
         * y1-x(y1/x1) = ax^2 + bx
         * 0 = ax^2 + xb - x(y1)/(x1) - y1
         * 0 = ax^2 + (y1/x1 - b)x - y1
         * a = a
         * b = b + y1/x1
         * c = -y1
         * result = (-b +- Math.sqrt(Math.pow(b, 2) - (4 * a * c))) / (2 * a);
         * result = (-(y1/x1 - b) +- Math.sqrt(Math.pow(y1/x1 - b, 2) - (4 * a * -y1))) / (2 * a);
         * by playing with this https://www.desmos.com/calculator/urjcy3zcua we can see to always use plus
         */
        let x1 = this.sa.complete_x - this.red_line_start_x;
        let y1 = this.sa.y - this.red_line_start_y;
        if (this.sa.break_days.length) {
            const mods = this.calcModDays();
            x1 -= Math.floor((this.sa.x - this.red_line_start_x) / 7) * this.sa.break_days.length + mods[(this.sa.x - this.red_line_start_x) % 7];
        }

        let a = this.a;
        let b = this.b + y1/x1;
        let c = -y1;
        if (a)
            var intersection_x = (-b + Math.sqrt(Math.pow(b, 2) - (4 * a * c))) / (2 * a);
        else
            // y = y1 - x(y1/x1)
            // y = (y1/x1)x
            // (y1/x1)x = y1 - x(y1/x1)
            // 2 x y1 = y1 x1
            // 2 x = x1
            // x = x1 / 2
            var intersection_x = x1 / 2;

        let x_step = x1 / VisualAssignment.TOTAL_ARROW_SKEW_RATIO_STEPS;
        intersection_x = x_step * Math.round(intersection_x / x_step);
        if (this.pressed_arrow_key === "ArrowUp")
            var next_intersection_x = intersection_x - x_step;
        else if (this.pressed_arrow_key === "ArrowDown")
            var next_intersection_x = intersection_x + x_step;
        else return // safety
        
        // plug in next_intersection_x as x into y = y1 - x(y1/x1)
        let next_intersection = [next_intersection_x, y1 - next_intersection_x * y1/x1];
        let parabola = this.calcAandBfromOriginAndTwoPoints(next_intersection, [x1, y1]);

        const original_skew_ratio = this.sa.skew_ratio;
        this.sa.skew_ratio = (parabola.a + parabola.b) * x1 / y1;

        const skew_ratio_bound = this.calcSkewRatioBound();
        // use original_skew_ratio to allow one more arrow before bound so the parabols completely flattens
        // add && or else holding down will cause themselves to trigger each other in an infinite loop
        if (original_skew_ratio >= skew_ratio_bound && this.pressed_arrow_key === "ArrowUp") {
            this.sa.skew_ratio = 2 - skew_ratio_bound;
        } else if (original_skew_ratio <= 2 - skew_ratio_bound && this.pressed_arrow_key === "ArrowDown") {
            this.sa.skew_ratio = skew_ratio_bound;
        }

        this.setDynamicStartIfInDynamicMode();
        ajaxUtils.sendAttributeAjaxWithTimeout('skew_ratio', this.sa.skew_ratio, this.sa.id);
        priority.sort({ timeout: true });
        this.draw();
    }
    //hard (this entire function)
    draw(raw_x, raw_y) {
        const len_works = this.sa.works.length - 1;
        const last_work_input = this.sa.works[len_works];
        const today_minus_assignment_date = mathUtils.daysBetweenTwoDates(date_now, this.sa.assignment_date);
        // Number.isFinite(raw_x) && Number.isFinite(raw_y) is needed because resize() can call draw() while draw_mouse_point is true but not pass any mouse coordinates, from for example resizing the browser
        if (this.draw_mouse_point && Number.isFinite(raw_x) && Number.isFinite(raw_y)) {
            var mouse_x = (raw_x - (50 + VisualAssignment.MOUSE_POSITION_TRANSFORM.x)) / this.wCon,
                mouse_y = (this.height - raw_y - (50 + VisualAssignment.MOUSE_POSITION_TRANSFORM.y)) / this.hCon;
            if (mouse_x >= (Math.round(mouse_x) + this.sa.complete_x) / 2)
                mouse_x = this.sa.x;
            else
                mouse_x = Math.round(mouse_x);
            if (mouse_x < Math.min(this.red_line_start_x, this.sa.blue_line_start))
                mouse_x = Math.min(this.red_line_start_x, this.sa.blue_line_start);
            else if (mouse_x > this.sa.x)
                mouse_x = this.sa.x;
            if (this.sa.blue_line_start <= mouse_x && mouse_x <= len_works + this.sa.blue_line_start) {
                if (Math.ceil(mouse_x) < this.red_line_start_x) {
                    mouse_y = true;
                } else {
                    mouse_y = Math.abs(mouse_y - this.funct(mouse_x)) > Math.abs(mouse_y - this.sa.works[mouse_x - this.sa.blue_line_start]);
                }
            } else {
                mouse_y = false;
            }
            if (!this.set_skew_ratio_using_graph && this.last_mouse_x === mouse_x && this.last_mouse_y === mouse_y) {
                return;
            }
            this.last_mouse_x = mouse_x;
            this.last_mouse_y = mouse_y;
        }
        // draw() always runs setParabolaValues but I'll leave it like this because it'll require a lot of maintence
        
        this.setParabolaValues();
        const screen = this.graph[0].getContext("2d");
        screen.scale(this.scale, this.scale);
        screen.clearRect(0, 0, this.width, this.height);
        let move_info_down,
            goal_for_this_day;
        if (this.sa.blue_line_start + len_works < today_minus_assignment_date + 1) {
            goal_for_this_day = this.funct(today_minus_assignment_date + 1);
        } else {
            goal_for_this_day = this.sa.works[today_minus_assignment_date - this.sa.blue_line_start + 1];
        }
        // negative indexing from today_minus_assignment_date - this.sa.blue_line_start + 1 (if the assignment is assigned in the future)
        if (goal_for_this_day === undefined) {
            goal_for_this_day = this.funct(today_minus_assignment_date + 1);
        }
        if (SETTINGS.show_progress_bar) {
            move_info_down = 0;
            let should_be_done_x = this.width - 155 + goal_for_this_day / this.sa.y * 146,
                bar_move_left = should_be_done_x - this.width + 17;
            if (bar_move_left < 0 || this.dom_assignment.hasClass("completely-finished")) {
                bar_move_left = 0
            } else if (should_be_done_x > this.width - 8) {
                bar_move_left = this.width - 8;
            }
            // bar move left
            screen.fillStyle = $("html").is("#dark-mode") ? "rgb(200,200,200)" : "rgb(55,55,55)";
            screen.fillRect(this.width-155-bar_move_left, this.height-121,148,50);
            screen.fillStyle = $("html").is("#dark-mode") ? "rgb(255,0,255)" : "rgb(0,255,0)";
            screen.fillRect(this.width-153-bar_move_left, this.height-119,144,46);

            screen.fillStyle = $("html").is("#dark-mode") ? "rgb(255,127,255)" : "rgb(0,128,0)";
            const slash_x = this.width - 142 - bar_move_left;
            screen.beginPath();
            screen.moveTo(slash_x,this.height-119);
            screen.lineTo(slash_x+15,this.height-119);
            screen.lineTo(slash_x+52.5,this.height-73);
            screen.lineTo(slash_x+37.5,this.height-73);
            screen.fill();
            screen.beginPath();
            screen.moveTo(slash_x+35,this.height-119);
            screen.lineTo(slash_x+50,this.height-119);
            screen.lineTo(slash_x+87.5,this.height-73);
            screen.lineTo(slash_x+72.5,this.height-73);
            screen.fill();
            screen.beginPath();
            screen.moveTo(slash_x+70,this.height-119);
            screen.lineTo(slash_x+85,this.height-119);
            screen.lineTo(slash_x+122.5,this.height-73);
            screen.lineTo(slash_x+107.5,this.height-73);
            screen.fill();

            screen.textAlign = "center";
            screen.fillStyle = "black";
            screen.font = '13.75px Open Sans';
            screen.textBaseline = "top";
            if (this.dom_assignment.hasClass("completely-finished")) {
                screen.fillText("Completed!", this.width-81-bar_move_left, this.height-68);
            } else {
                screen.fillText(`Your Progress: ${Math.floor(last_work_input/this.sa.y*100)}%`, this.width-81, this.height-68);
                const done_x = this.width-153+last_work_input/this.sa.y*144-bar_move_left;
                screen.fillStyle = "white";
                screen.fillRect(done_x, this.height-119, this.width-9-bar_move_left-done_x, 46);
                if (should_be_done_x >= this.width - 153) {
                    screen.fillStyle = "black";
                    if (should_be_done_x > this.width - 17) {
                        should_be_done_x = this.width - 17;
                    }
                    screen.rotate(Math.PI / 2);
                    // (x, y) => (y, -x)
                    screen.fillText("Goal", this.height-95, -should_be_done_x-14);
                    screen.rotate(-Math.PI / 2);
                    screen.fillStyle = "rgb(55,55,55)";
                    screen.fillRect(should_be_done_x, this.height-119, 2, 46);
                }
            }
        } else {
            move_info_down = 72;
        }
        
        const rounded_skew_ratio = mathUtils.precisionRound(this.sa.skew_ratio - 1, VisualAssignment.SKEW_RATIO_ROUND_PRECISION);
        screen.textAlign = "end";
        screen.fillStyle = "black";
        screen.textBaseline = "top";
        screen.font = '13.75px Open Sans';
        screen.fillText(this.sa.fixed_mode ? "Fixed Mode" : "Dynamic Mode", this.width-2, this.height-155+move_info_down);
        screen.fillText(`Curvature: ${rounded_skew_ratio}${rounded_skew_ratio ? "" : " (Linear)"}`, this.width-2, this.height-138+move_info_down);
        let radius = this.wCon / 3;
        if (radius > 3) {
            radius = 3;
        } else if (radius < 2) {
            radius = 2;
        }

        let circle_x,
            circle_y,
            line_end = this.sa.complete_x + Math.ceil(1 / this.wCon);
        if ($("html").is("#dark-mode")) {
            screen.strokeStyle = `rgb(
                ${255 - VisualAssignment.RED_LINE_COLOR.r},
                ${255 - VisualAssignment.RED_LINE_COLOR.g},
                ${255 - VisualAssignment.RED_LINE_COLOR.b}
            )`.replace(/\s+/g, '');
        } else {
            screen.strokeStyle = `rgb(
                ${VisualAssignment.RED_LINE_COLOR.r},
                ${VisualAssignment.RED_LINE_COLOR.g},
                ${VisualAssignment.RED_LINE_COLOR.b}
            )`.replace(/\s+/g, '');
        }
        screen.lineWidth = radius;
        screen.beginPath();
        for (let point = (this.sa.fixed_mode || DEBUG === "True") ? this.red_line_start_x : this.sa.blue_line_start + len_works; point < line_end; point += Math.ceil(1 / this.wCon)) {
            circle_x = point * this.wCon + 50;
            if (circle_x > this.width - 5) {
                circle_x = this.width - 5;
            }
            circle_y = this.height - this.funct(point) * this.hCon - 50;
            screen.lineTo(circle_x - (point === this.red_line_start_x) * radius / 2, circle_y); // (point === this.red_line_start_x) * radius / 2 makes sure the first point is filled in properly
            screen.arc(circle_x, circle_y, radius, 0, 2 * Math.PI);
            screen.moveTo(circle_x, circle_y);
        }
        screen.stroke();
        screen.beginPath();
        radius *= 0.75;
        line_end = Math.min(line_end, len_works + Math.ceil(1 / this.wCon));
        if ($("html").is("#dark-mode")) {
            screen.strokeStyle = `rgb(
                ${255 - VisualAssignment.BLUE_LINE_COLOR.r},
                ${255 - VisualAssignment.BLUE_LINE_COLOR.g},
                ${255 - VisualAssignment.BLUE_LINE_COLOR.b}
            )`.replace(/\s+/g, '');
        } else {
            screen.strokeStyle = `rgb(
                ${VisualAssignment.BLUE_LINE_COLOR.r},
                ${VisualAssignment.BLUE_LINE_COLOR.g},
                ${VisualAssignment.BLUE_LINE_COLOR.b}
            )`.replace(/\s+/g, '');
        }
        screen.lineWidth = radius;
        for (let point = 0; point < line_end; point += Math.ceil(1 / this.wCon)) {
            circle_x = Math.min(this.sa.complete_x, point + this.sa.blue_line_start) * this.wCon + 50;
            circle_y = this.height - this.sa.works[Math.min(len_works, point)] * this.hCon - 50;
            
            screen.lineTo(circle_x - (point === 0) * radius / 2, circle_y);
            screen.arc(circle_x, circle_y, radius, 0, 2 * Math.PI);
            screen.moveTo(circle_x, circle_y);
        }
        radius /= 0.75;
        screen.stroke();
        screen.textBaseline = "top";
        screen.textAlign = "start";
        screen.font = VisualAssignment.font_size + 'px Open Sans';
        if (this.draw_mouse_point && Number.isFinite(raw_x) && Number.isFinite(raw_y)) {
            let funct_mouse_x;
            if (mouse_y) {
                funct_mouse_x = this.sa.works[mouse_x - this.sa.blue_line_start];
            } else {
                funct_mouse_x = this.funct(mouse_x);
            }
            let str_mouse_x;
            if (mouse_x === this.sa.x && this.sa.due_time && (this.sa.due_time.hour || this.sa.due_time.minute)) {
                str_mouse_x = new Date(this.complete_due_date.valueOf());
                str_mouse_x = str_mouse_x.toLocaleDateString("en-US", {...this.date_string_options_no_weekday, hour: "numeric", minute: "numeric"});
                // mouse_x as a variable isnt needed anymore. Set it to complete_x if at x to position the point
                mouse_x = this.sa.complete_x;
            } else {
                str_mouse_x = new Date(this.sa.assignment_date.valueOf());
                str_mouse_x.setDate(str_mouse_x.getDate() + mouse_x);
                str_mouse_x = str_mouse_x.toLocaleDateString("en-US", this.date_string_options_no_weekday);
            }
            if (this.wCon * mouse_x + 50 + screen.measureText(`(Day: ${str_mouse_x}, ${pluralize(this.sa.unit,1)}: ${funct_mouse_x})`).width > this.width - 5) {
                screen.textAlign = "end";
            }
            if (this.height - funct_mouse_x * this.hCon - 50 + screen.measureText(0).width * 2 > this.height - 50) {
                screen.textBaseline = "bottom";
            }
            screen.fillStyle = "black";
            screen.fillText(` (Day: ${str_mouse_x}, ${pluralize(this.sa.unit,1)}: ${funct_mouse_x}) `, this.wCon * mouse_x + 50, this.height - funct_mouse_x * this.hCon - 50);
            if ($("html").is("#dark-mode")) {
                screen.fillStyle = `rgb(
                    ${255 - VisualAssignment.DRAW_POINT_COLOR.r},
                    ${255 - VisualAssignment.DRAW_POINT_COLOR.g},
                    ${255 - VisualAssignment.DRAW_POINT_COLOR.b}
                )`.replace(/\s+/g, '');
            } else {
                screen.fillStyle = `rgb(
                    ${VisualAssignment.DRAW_POINT_COLOR.r},
                    ${VisualAssignment.DRAW_POINT_COLOR.g},
                    ${VisualAssignment.DRAW_POINT_COLOR.b}
                )`.replace(/\s+/g, '');
            }
            screen.strokeStyle = screen.fillStyle;
            screen.beginPath();
            screen.arc(this.wCon * mouse_x + 50, this.height - funct_mouse_x * this.hCon - 50, radius, 0, 2 * Math.PI);
            screen.stroke();
            screen.fill();
            screen.fillStyle = "black";
        }
        
        screen.textAlign = "center";
        screen.textBaseline = "bottom";
        screen.font = VisualAssignment.font_size + 'px Open Sans';
        const row_height = screen.measureText(0).width * 2;
        const center = (str, y_pos) => screen.fillText(str, 50+(this.width-50)/2, row_height*y_pos);
        if (!this.dom_assignment.parents(".assignment-container").hasClass("finished")) {
            let displayed_day;
            let str_day;
            if (this.sa.blue_line_start + len_works === this.sa.x && this.sa.due_time && (this.sa.due_time.hour || this.sa.due_time.minute)) {
                displayed_day = new Date(this.complete_due_date.valueOf());
                str_day = displayed_day.toLocaleDateString("en-US", {...this.date_string_options, hour: "numeric", minute: "numeric"});
            } else {
                displayed_day = new Date(this.sa.assignment_date.valueOf());
                displayed_day.setDate(displayed_day.getDate() + this.sa.blue_line_start + len_works);
                str_day = displayed_day.toLocaleDateString("en-US", this.date_string_options);
            }
            const distance_today_from_displayed_day = today_minus_assignment_date - this.sa.blue_line_start - len_works;
            switch (distance_today_from_displayed_day) {
                case -1:
                    str_day += ' (Tomorrow)';
                    break;
                case 0:
                    str_day += ' (Today)';
                    break;
                case 1:
                    str_day += ' (Yesterday)';
                    break;
            }
            str_day += ':';

            let todo = mathUtils.precisionRound(this.funct(len_works + this.sa.blue_line_start + 1) - last_work_input, 10);
            if (todo < 0 || this.sa.break_days.includes((this.assign_day_of_week + this.sa.blue_line_start + len_works) % 7)) {
                todo = 0;
            }

            if (displayed_day.valueOf() !== date_now.valueOf()) {
                center(str_day, 1);
                center(`${pluralize(this.sa.unit, 2)} to Complete for this Day: ${todo} (${utils.formatting.formatMinutes(todo * this.sa.time_per_unit)})`, 2);
            }
        }
        screen.scale(1 / this.scale, 1 / this.scale);
    }
    //hard (the entire function)
    drawFixed() {
        const screen = this.fixed_graph[0].getContext("2d");
        screen.scale(this.scale, this.scale);
        let gradient = screen.createLinearGradient(0, 0, 0, this.height * 4 / 3);
        gradient.addColorStop(0, "white");
        gradient.addColorStop(1, "lightgray");
        screen.fillStyle = gradient;
        screen.fillRect(0, 0, this.width, this.height * 4 / 3);

        // x and y axis rectangles
        screen.fillStyle = "rgb(185,185,185)";
        screen.fillRect(40, 0, 10, this.height);
        screen.fillRect(0, this.height - 50, this.width, 10);

        // x axis label
        screen.fillStyle = "black";
        screen.textAlign = "center";
        screen.font = '17.1875px Open Sans';
        screen.fillText("Days", (this.width - 50) / 2 + 50, this.height - 5);

        // y axis label
        screen.rotate(-Math.PI / 2);
        if (this.unit_is_of_time) {
            const plural = pluralize(this.sa.unit);
            var text = `${plural[0].toUpperCase() + plural.substring(1).toLowerCase()} of Work`,
                label_x_pos = -3;
        } else {
            var text = `${pluralize(this.sa.unit)} (${utils.formatting.formatMinutes(this.sa.time_per_unit)} per ${pluralize(this.sa.unit,1)})`,
                label_x_pos = 0;
        }
        if (screen.measureText(text).width > this.height - 50) {
            text = pluralize(this.sa.unit);
        }
        screen.textBaseline = "hanging";
        screen.fillText(text, -(this.height - 50) / 2, label_x_pos);
        screen.rotate(Math.PI / 2);

        screen.font = '13.75px Open Sans';
        screen.textBaseline = "top";
        const x_axis_scale = Math.pow(10, Math.floor(Math.log10(this.sa.complete_x))) * Math.ceil(this.sa.complete_x.toString()[0] / Math.ceil((this.width - 100) / 100));
        if (this.sa.complete_x >= 10) {
            gradient = screen.createLinearGradient(0, 0, 0, this.height * 4 / 3);
            gradient.addColorStop(0, "gainsboro");
            gradient.addColorStop(1, "silver");
            const small_x_axis_scale = x_axis_scale / 5,
                label_index = screen.measureText(Math.floor(this.sa.complete_x)).width * 1.25 < small_x_axis_scale * this.wCon;
            for (let smaller_index = 1; smaller_index <= Math.floor(this.sa.complete_x / small_x_axis_scale); smaller_index++) {
                if (smaller_index % 5) {
                    const displayed_number = smaller_index * small_x_axis_scale;
                    screen.fillStyle = gradient; // Line color
                    screen.fillRect(displayed_number * this.wCon + 48.5, 0, 2, this.height - 50); // Draws line index
                    screen.fillStyle = "rgb(80,80,80)"; // Number color
                    if (label_index) {
                        const numberwidth = screen.measureText(displayed_number).width;
                        let number_x_pos = displayed_number * this.wCon + 50;
                        if (number_x_pos + numberwidth / 2 > this.width - 1) {
                            number_x_pos = this.width - numberwidth / 2 - 1;
                        }
                        screen.fillText(displayed_number, number_x_pos, this.height - 39);
                    }
                }
            }
        }

        screen.textBaseline = "alphabetic";
        screen.textAlign = "right";
        const y_axis_scale = Math.pow(10, Math.floor(Math.log10(this.sa.y))) * Math.ceil(this.sa.y.toString()[0] / Math.ceil((this.height - 100) / 100));
        let font_size2 = 16.90625 - Math.ceil(this.sa.y - this.sa.y % y_axis_scale).toString().length * 1.71875;
        if (this.sa.y >= 10) {
            const small_y_axis_scale = y_axis_scale / 5;
            if (font_size2 < 8.5) {
                font_size2 = 8.5;
            }
            screen.font = font_size2 + 'px Open Sans';
            const text_height = screen.measureText(0).width * 2,
                label_index = text_height < small_y_axis_scale * this.hCon;
            for (let smaller_index = 1; smaller_index <= Math.floor(this.sa.y / small_y_axis_scale); smaller_index++) {
                const displayed_number = smaller_index * small_y_axis_scale;
                if (smaller_index % 5) {
                    const gradient_percent = 1 - (displayed_number * this.hCon) / (this.height - 50);
                    screen.fillStyle = `rgb(${220-16*gradient_percent},${220-16*gradient_percent},${220-16*gradient_percent})`;
                    screen.fillRect(50, this.height - 51.5 - displayed_number * this.hCon, this.width - 50, 2);
                    screen.fillStyle = "rgb(80,80,80)";
                    if (label_index) {
                        let number_y_pos = this.height - displayed_number * this.hCon - 54 + text_height / 2;
                        if (number_y_pos < 4 + text_height / 2) {
                            number_y_pos = 4 + text_height / 2;
                        }
                        if (38.5 - screen.measureText(displayed_number).width < 13 - label_x_pos) {
                            screen.textAlign = "left";
                            screen.fillText(displayed_number, 13 - label_x_pos, number_y_pos);
                            screen.textAlign = "right";
                        } else {
                            screen.fillText(displayed_number, 38.5, number_y_pos);
                        }
                    }
                }
            }
        }
        font_size2 *= 1.2;
        screen.font = font_size2 + 'px Open Sans';
        const text_height = screen.measureText(0).width * 2;
        for (let bigger_index = Math.ceil(this.sa.y - this.sa.y % y_axis_scale); bigger_index > 0; bigger_index -= y_axis_scale) {
            if (bigger_index * 2 < y_axis_scale) {
                break;
            }
            screen.fillStyle = "rgb(205,205,205)";
            screen.fillRect(50, this.height - bigger_index * this.hCon - 52.5, this.width - 50, 5);
            screen.fillStyle = "black";
            let number_y_pos = this.height - bigger_index * this.hCon - 54 + text_height / 2;
            if (number_y_pos < 4 + text_height / 2) {
                number_y_pos = 4 + text_height / 2;
            }
            if (38.5 - screen.measureText(bigger_index).width < 13 - label_x_pos) {
                screen.textAlign = "left";
                screen.fillText(bigger_index, 13 - label_x_pos, number_y_pos);
                screen.textAlign = "right";
            } else {
                screen.fillText(bigger_index, 38.5, number_y_pos);
            }
        }
        screen.fillText(0, 39, this.height - 52);

        screen.textBaseline = "top";
        screen.textAlign = "center";
        screen.font = '16.5px Open Sans';
        for (let bigger_index = Math.ceil(this.sa.complete_x - this.sa.complete_x % x_axis_scale); bigger_index > 0; bigger_index -= x_axis_scale) {
            screen.fillStyle = "rgb(205,205,205)";
            screen.fillRect(bigger_index * this.wCon + 47.5, 0, 5, this.height - 50);
            screen.fillStyle = "black";
            const numberwidth = screen.measureText(bigger_index).width;
            let number_x_pos = bigger_index * this.wCon + 50;
            if (number_x_pos + numberwidth / 2 > this.width - 1) {
                number_x_pos = this.width - numberwidth / 2 - 1;
            }
            screen.fillText(bigger_index, number_x_pos, this.height - 39);
        }
        screen.fillText(0, 55.5, this.height - 38.5);
        const today_minus_assignment_date = mathUtils.daysBetweenTwoDates(date_now, this.sa.assignment_date);;
        if (today_minus_assignment_date > -1 && today_minus_assignment_date <= this.sa.complete_x) {
            let today_x = today_minus_assignment_date * this.wCon + 47.5;
            screen.fillStyle = "rgb(150,150,150)";
            screen.fillRect(today_x, 0, 5, this.height - 50);
            screen.fillStyle = "black";
            screen.rotate(Math.PI / 2);
            screen.textAlign = "center";
            screen.textBaseline = "middle";
            screen.font = '17.1875px Open Sans';
            if (today_x > this.width - 12.5) {
                today_x = this.width - 12.5;
            }
            screen.fillText("Today Line", (this.height - 50)/2, -today_x - 2.5);
            screen.rotate(-Math.PI / 2);
        }
    }
    static assignmentGraphOnScreen($dom_assignment) {
        const fixed_graph = $dom_assignment.find(".fixed-graph");
        const rect = fixed_graph[0].getBoundingClientRect();
        // Makes sure graph is on screen
        return rect.bottom - rect.height / 1.5 > 70 && rect.y + rect.height / 1.5 < window.innerHeight;
    }
    setGraphButtonEventListeners() {
        // might be easier to set the clicks to $(document) but will do later
        const skew_ratio_button = this.dom_assignment.find(".skew-ratio-button"),
                work_input_textbox = this.dom_assignment.find(".work-input-textbox"),
                skew_ratio_textbox = this.dom_assignment.find(".skew-ratio-textbox"),
                submit_work_button = this.dom_assignment.find(".submit-work-button"),
                fixed_mode_button = this.dom_assignment.find(".fixed-mode-button"),
                delete_work_input_button = this.dom_assignment.find(".delete-work-input-button");
        this.graph.off("mousemove").mousemove(this.mousemove.bind(this)); // Turn off mousemove to ensure there is only one mousemove handler at a time
        $(window).resize(this.resize.bind(this));

        // BEGIN Up and down arrow event handler
        let graphtimeout,
            fired = false, // $(document).keydown( fires for every frame a key is held down. This makes it behaves like it fires once
            graphinterval;
        $(document).keydown(e => {
            // fixed_graph.is(":visible") to make sure it doesnt change when the assignment is closed
            if ((e.key === "ArrowUp" || e.key === "ArrowDown") && !e.shiftKey && this.fixed_graph.is(":visible")) {
                if (VisualAssignment.assignmentGraphOnScreen(this.dom_assignment) && !fired) {
                    // "fired" makes .keydown fire only when a key is pressed, not repeatedly
                    fired = true;
                    this.pressed_arrow_key = e.key;
                    this.arrowSkewRatio();
                    graphtimeout = setTimeout(function() {
                        clearInterval(graphinterval);
                        graphinterval = setInterval(this.arrowSkewRatio.bind(this), VisualAssignment.ARROW_KEYDOWN_INTERVAL);
                    }.bind(this), VisualAssignment.ARROW_KEYDOWN_THRESHOLD);
                }
            }
        }).keyup(e => {
            // Ensures the same key pressed fires the keyup to stop change skew ratio
            // Without this, you could press another key while the down arrow is being pressed for example and stop graphinterval
            if (e.key === this.pressed_arrow_key) {
                fired = false;
                clearTimeout(graphtimeout);
                clearInterval(graphinterval);
            }
        });
        // END Up and down arrow event handler

        // BEGIN Delete work input button
        let not_applicable_timeout_delete_work_input_button;
        delete_work_input_button.click(() => {
            let len_works = this.sa.works.length - 1;
            if (!len_works) {
                delete_work_input_button.html("Nothing to Delete");
                clearTimeout(not_applicable_timeout_delete_work_input_button);
                not_applicable_timeout_delete_work_input_button = setTimeout(function() {
                    delete_work_input_button.html("Delete Work Input");
                }, VisualAssignment.BUTTON_ERROR_DISPLAY_TIME);
                return;
            }
            this.sa.works.pop();
            len_works--;
            for (let i = 0; i < AUTOTUNE_ITERATIONS; i++) {
                this.setDynamicStartIfInDynamicMode();
                this.autotuneSkewRatio({ inverse: false });
            }
            this.setDynamicStartIfInDynamicMode();
            ajaxUtils.sendAttributeAjaxWithTimeout("dynamic_start", this.sa.dynamic_start, this.sa.id);
            ajaxUtils.sendAttributeAjaxWithTimeout("works", this.sa.works.map(String), this.sa.id);
            priority.sort({ timeout: true });
            this.draw();
        });
        // END Delete work input button

        // BEGIN Work input textbox
        work_input_textbox.keydown(e => {
            if (e.key === "Enter") {
                submit_work_button.click();
                work_input_textbox.val("");
            }
        });
        // END Work input textbox

        // BEGIN Submit work button
        submit_work_button.click(() => {
            const today_minus_assignment_date = mathUtils.daysBetweenTwoDates(date_now, this.sa.assignment_date);
            let len_works = this.sa.works.length - 1;
            let last_work_input = this.sa.works[len_works];
            let not_applicable_message_title;
            let not_applicable_message_description;
            if (!work_input_textbox.val()) {
                not_applicable_message_title = "Enter a Value.";
                not_applicable_message_description = "Please enter a number or keyword (which can be found in the <a href=\"user-guide#standard-assignment-graph-controls\">user guide</a>) into the textbox to submit a work input."
            } else if (last_work_input >= this.sa.y) {
                not_applicable_message_title = "Already Finished.";
                not_applicable_message_description = "You've already finished this assignment, so you can't enter any more work inputs.";
            }
            let todo = this.funct(len_works + this.sa.blue_line_start + 1) - last_work_input;
            let input_done = work_input_textbox.val().trim().toLowerCase();
            let bypass_in_progress = false;
            if (input_done.startsWith("since")) {
                input_done = +input_done.replace("since", "").trim();
                if (isNaN(input_done)) {
                    not_applicable_message_title = "Invalid \"since\" format.";
                    not_applicable_message_description = "Please use the \"since\" keyword with the format: \"since [some number]\", with [some number] being your work input.";
                }
                const today_minus_assignment_date = mathUtils.daysBetweenTwoDates(date_now, this.sa.assignment_date);
                const array_length = today_minus_assignment_date - (this.sa.blue_line_start + len_works) - 1;
                if (array_length < 0) return;
                this.sa.works.push(...new Array(array_length).fill(last_work_input));
                len_works = this.sa.works.length - 1;
            } else if (input_done.startsWith("tom")) {
                input_done = +input_done.replace("tom", "").trim();
                if (isNaN(input_done)) {
                    not_applicable_message_title = "Invalid \"tom\" format.";
                    not_applicable_message_description = "Please use the \"tom\" keyword with the format: \"tom [some number]\", with [some number] being your work input.";
                }
                bypass_in_progress = true;
            } else {
                switch (input_done) {
                    case "done":
                    case "fin":
                        input_done = Math.max(0, todo);
                        break;
                    default: {
                        input_done = +input_done;
                        if (isNaN(input_done)) {
                            not_applicable_message_title = "Invalid Number.";
                            not_applicable_message_description = "Please enter a valid number into the textbox to submit a work input."
                        }
                    }
                }
            }
            // Prematurely increment for calculations
            len_works++;
            if (!not_applicable_message_title) {
                if (this.sa.break_days.includes((this.assign_day_of_week + this.sa.blue_line_start + len_works - 1) % 7)) {
                    todo = 0;
                }
                // this.sa.x + 1 because the user can enter an earlier due date and cut off works at the due date, which messes up soft due dates without this
                if ([this.sa.x, this.sa.x + 1].includes(len_works + this.sa.blue_line_start) && input_done + last_work_input < this.sa.y
                    && this.sa.soft) {
                    const original_red_line_start_x = this.red_line_start_x;
                    this.red_line_start_x = len_works + this.sa.blue_line_start;
                    this.incrementDueDate();
                    this.red_line_start_x = original_red_line_start_x;
                }
            }
            if ((len_works-1) + this.sa.blue_line_start === this.sa.x) {
                not_applicable_message_title = "End of Assignment.";
                not_applicable_message_description = "You've reached the end of this assignment, and there are no more work inputs to submit.";
            }
            if (not_applicable_message_title) {
                $.alert({
                    title: not_applicable_message_title,
                    content: not_applicable_message_description,
                    onDestroy: () => work_input_textbox.focus(),
                });
                return;
            }
            // Clear once textbox if the input is valid
            work_input_textbox.val("");
            // Cap at y and 0
            if (input_done + last_work_input > this.sa.y) {
                input_done = this.sa.y - last_work_input;
            } else if (input_done + last_work_input < 0) {
                input_done = -last_work_input;
            }
            last_work_input = mathUtils.precisionRound(last_work_input + input_done, 10);
            // len_works-1 to undo the ++ earlier
            if (SETTINGS.use_in_progress && !bypass_in_progress && today_minus_assignment_date + 1 === (len_works-1) + this.sa.blue_line_start) {
                this.sa.works.pop();

                // Attempts to undo the last work input to ensure the autotune isn't double dipped
                // Note that the invsering of the autotune algorithm is still not perfect, but usable
                for (let i = 0; i < AUTOTUNE_ITERATIONS; i++) {
                    this.setDynamicStartIfInDynamicMode();
                    this.autotuneSkewRatio({ inverse: false });
                }
                this.setDynamicStartIfInDynamicMode();
            }
            this.sa.works.push(last_work_input);
            
            // +Add this check for setDynamicModeIfInDynamicMode
            // -Old dynamic_starts, although still valid, may not be the closest value to len_works + this.sa.blue_line_start, and this can cause inconsistencies
            // +However, removing this check causes low skew ratios to become extremely inaccurate in dynamic mode
            // Autotune and setDynamicStartIfInDynamicMode somewhat fix this but fails with high minimum work times
            // -However, this isn't really that much of a problem; I can just call this a "feature" of dynamic mode in that it tries to make stuff linear. Disabling this makes dynamic mode completely deterministic in its red line start

            // Remember to add this check to the above autotune if I decide to add this back

            // if (input_done !== todo) {
                for (let i = 0; i < AUTOTUNE_ITERATIONS; i++) {
                    this.setDynamicStartIfInDynamicMode();
                    this.autotuneSkewRatio();
                }
                this.setDynamicStartIfInDynamicMode();
            // }

            ajaxUtils.sendAttributeAjaxWithTimeout("dynamic_start", this.sa.dynamic_start, this.sa.id);
            ajaxUtils.sendAttributeAjaxWithTimeout("works", this.sa.works.map(String), this.sa.id);
            
            // Delay resize because the graphs don't draw while the assignment is clsoing
            if (SETTINGS.close_graph_after_work_input && this.sa.blue_line_start + len_works === today_minus_assignment_date + 1) {
                priority.sort({ timeout: true, delayResize: true });
                this.dom_assignment.click();
            } else {
                priority.sort({ timeout: true, delayResize: false });
            }
            this.draw();
        });
        // END Submit work button

        // BEGIN Set skew ratio using graph button
        let original_skew_ratio;
        let not_applicable_timeout_skew_ratio_button;
        skew_ratio_button.click(() => {
            if (original_skew_ratio) {
                skew_ratio_button.onlyText("Set Curvature of the Graph");
                this.set_skew_ratio_using_graph = false;
                this.sa.skew_ratio = original_skew_ratio;
                original_skew_ratio = undefined;
                this.setDynamicStartIfInDynamicMode();
                this.draw();
                // No need to ajax since skew ratio is the same
                return;
            }
            if (this.getWorkingDaysRemaining({ reference: "blue line end" }) <= 1) {
                skew_ratio_button.onlyText("Not Applicable");
                clearTimeout(not_applicable_timeout_skew_ratio_button);
                not_applicable_timeout_skew_ratio_button = setTimeout(function() {
                    skew_ratio_button.onlyText("Set Curvature of the Graph");
                }, VisualAssignment.BUTTON_ERROR_DISPLAY_TIME);
                return;
            }
            original_skew_ratio = this.sa.skew_ratio;
            skew_ratio_button.onlyText("Hover the graph. Click again to cancel");
            // Turn off mousemove to ensure there is only one mousemove handler at a time
            this.graph.off("mousemove").mousemove(this.mousemove.bind(this));
            this.graph.trigger("mousemove");
            this.set_skew_ratio_using_graph = true;
        });
        this.graph.click(e => {
            if (this.set_skew_ratio_using_graph) {
                // Runs if (set_skew_ratio_using_graph && draw_mouse_point || set_skew_ratio_using_graph && !draw_mouse_point)
                original_skew_ratio = undefined;
                this.set_skew_ratio_using_graph = false;
                skew_ratio_button.onlyText("Set Curvature of the Graph");
                ajaxUtils.sendAttributeAjaxWithTimeout('skew_ratio', this.sa.skew_ratio, this.sa.id);
                if (!this.draw_mouse_point) {
                    this.graph.off("mousemove");
                }
                priority.sort();
                this.draw();
            } else if (this.draw_mouse_point) {
                if (!isMobile) {
                    // Runs if (!set_skew_ratio_using_graph && draw_mouse_point) and not on mobile
                    // Disable draw point
                    this.graph.off("mousemove");
                    this.draw_mouse_point = false;
                    delete this.last_mouse_x;
                    this.draw();
                }
            } else {
                // Runs if (!set_skew_ratio_using_graph && !draw_mouse_point)
                // Enable draw point
                this.draw_mouse_point = true;
                // Turn off mousemove to ensure there is only one mousemove handler at a time
                this.graph.off("mousemove").mousemove(this.mousemove.bind(this));
                // Pass in e because $.trigger makes e.pageX undefined
                this.mousemove(e);
            }
        });
        // END Set skew ratio button using graph button

        // BEGIN Skew ratio textbox
        let not_applicable_timeout_skew_ratio_textbox;
        skew_ratio_textbox.on("keydown paste click keyup", () => { // keyup for delete
            const skew_ratio_bound = this.calcSkewRatioBound();
            const max_textbox_value = Math.max(skew_ratio_bound - 1, 0.1);
            skew_ratio_textbox.attr({
                min: -max_textbox_value,
                max: max_textbox_value,
            });
            if (this.getWorkingDaysRemaining({ reference: "blue line end" }) <= 1) {
                skew_ratio_textbox.val('').attr("placeholder", "Not Applicable");
                clearTimeout(not_applicable_timeout_skew_ratio_textbox);
                not_applicable_timeout_skew_ratio_textbox = setTimeout(function() {
                    skew_ratio_textbox.attr("placeholder", "Enter Curvature");
                }, VisualAssignment.BUTTON_ERROR_DISPLAY_TIME);
                return;
            }
            if (skew_ratio_textbox.val()) {
                // Sets and caps skew ratio
                // The skew ratio in the code is 1 more than the displayed skew ratio
                this.sa.skew_ratio = mathUtils.clamp(2 - skew_ratio_bound, +skew_ratio_textbox.val() + 1, skew_ratio_bound);
                ajaxUtils.sendAttributeAjaxWithTimeout('skew_ratio', this.sa.skew_ratio, this.sa.id);
            }
            this.setDynamicStartIfInDynamicMode();
            this.draw();
        }).keypress(e => {
            if (e.key === "Enter") {
                // Triggers the below
                skew_ratio_textbox.blur();
            }
        }).focusout(() => {
            skew_ratio_textbox.val('');
            priority.sort();
        });
        // END Skew ratio textbox

        // BEGIN Fixed/dynamic mode button
        fixed_mode_button.click(() => {
            this.sa.fixed_mode = !this.sa.fixed_mode;
            fixed_mode_button.onlyText(this.sa.fixed_mode ? "Switch to Dynamic mode" : "Switch to Fixed mode");
            ajaxUtils.sendAttributeAjaxWithTimeout('fixed_mode', this.sa.fixed_mode, this.sa.id);
            if (this.sa.fixed_mode) {
                this.red_line_start_x = 0;
                this.red_line_start_y = 0;
            } else {
                this.red_line_start_x = this.sa.dynamic_start;
                this.red_line_start_y = this.sa.works[this.red_line_start_x - this.sa.blue_line_start];
            }
            // Skew ratio can be changed in fixed mode, making dynamic_start inaccurate
            for (let i = 0; i < AUTOTUNE_ITERATIONS; i++) {
                this.setDynamicStartIfInDynamicMode();
                this.autotuneSkewRatio();
            }
            this.setDynamicStartIfInDynamicMode();
            priority.sort();
            this.draw();
        }).html(this.sa.fixed_mode ? "Switch to Dynamic mode" : "Switch to Fixed mode");
        // END Fixed/dynamic mode button        
    }
    static shake_assignment($assignment_to_shake) {
        $assignment_to_shake.animate({left: -5}, 75, "easeOutCubic", function() {
            $assignment_to_shake.animate({left: 5}, 75, "easeOutCubic", function() {
                $assignment_to_shake.animate({left: 0}, 75, "easeOutCubic");
            });
        });
    }
}
let already_ran_tutorial = false;
let prevent_click = false;
$(function() {
$(".assignment").click(function(e/*, params={ initUI: true }*/) {
    const target = $(e.target);
    const targetInHeader = !!target.parents(".assignment-header").length || target.is(".assignment-header, .assignment");
    const targetInTags = !!target.parents(".tags").length || target.is(".tags");
    const targetInButton = !!target.parents(".button").length || target.is(".button");
    const dontFire = targetInTags || targetInButton;
    if (!(targetInHeader && !dontFire) || prevent_click) return;
    const dom_assignment = $(this);
    const sa_sa = utils.loadAssignmentData(dom_assignment);
    
    // If the assignment is marked as completed but marked as completed isn't enabled, it must have been marked because of break days, an incomplete work schedule, or needs more information
    if (dom_assignment.is(".mark-as-done:not(.open-assignment)") && !sa_sa.mark_as_done) {
        let assignment_to_shake = $(".assignment").first();
        new Promise(function(resolve) {
                setTimeout(function() {
                    // scrollIntoView sometimes doesn't work without setTimeout
                    assignment_to_shake[0].scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest',
                    });
                }, 0);
                // utils.scroll determines when the page has stopped scrolling and internally resolves the promise
                $("main").scroll(() => utils.scroll(resolve));
                utils.scroll(resolve);
        }).then(() => VisualAssignment.shake_assignment(assignment_to_shake.focus()));
        return;
    } else if (sa_sa.needs_more_info) {
        VisualAssignment.shake_assignment(dom_assignment);
        dom_assignment.find(".update-button").parents(".button").focus();
        return;
    }
   
    const first_click = !dom_assignment.hasClass('has-been-clicked');
    dom_assignment.addClass("has-been-clicked");
    const assignment_footer = dom_assignment.find(".assignment-footer");
    // Close assignment
    if (dom_assignment.hasClass("open-assignment")) {
        // Animate the graph's margin bottom to close the assignment and make the graph's overflow hidden
        assignment_footer.animate({
            marginBottom: -(assignment_footer.height() + parseFloat(dom_assignment.find(".graph-container").css("margin-top")))
        }, VisualAssignment.CLOSE_ASSIGNMENT_TRANSITION_DURATION, "easeOutCubic", function() {
            // Hide graph when transition ends
            dom_assignment.css("overflow", "");
            assignment_footer.css({
                display: "",
                marginBottom: "",
            });
        });
        dom_assignment.find(".falling-arrow-animation")[0].beginElement();
        dom_assignment.removeClass("open-assignment").css("overflow", "hidden");
        // name height can increase
        priority.positionTags(dom_assignment);
        return;
    }
    SETTINGS.one_graph_at_a_time && $("#close-assignments").click();
    
    const sa = new VisualAssignment(dom_assignment);
    // If the assignment was clicked while it was closing, stop the closing animation and open it
    assignment_footer.stop().css({
        display: "",
        marginBottom: "",
    });
    dom_assignment.css("overflow", "");
    dom_assignment.addClass("open-assignment");
    priority.positionTags(dom_assignment);
    utils.ui.displayTruncateWarning(dom_assignment);
    assignment_footer.css("display", "block");
    dom_assignment.find(".rising-arrow-animation")[0].beginElement();
    // Sets event handlers only on the assignment's first click
    first_click && sa.setGraphButtonEventListeners();
    sa.resize();
    if (SETTINGS.enable_tutorial && !already_ran_tutorial) {
        already_ran_tutorial = true;
        prevent_click = true;
        $("#tutorial-click-assignment-to-open").remove();
        setTimeout(function() {
            const days_until_due = Math.floor(sa.sa.complete_x) - sa.sa.blue_line_start;
            utils.ui.graphAlertTutorial(days_until_due);
            prevent_click = false;
        }, VisualAssignment.BUTTON_ERROR_DISPLAY_TIME);
    }
});
});