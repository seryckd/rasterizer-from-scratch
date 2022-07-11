import { Colour } from "./colour.js";
import { Point } from "./point.js";

export class CanvasWrap {

    /**
     * (0,0) is in the center of the canvas
     * (-x,-y) is the bottom left
     * (x, y) is the top right
     * 
     * @param {integer} width 
     * @param {integer} height 
     */
    constructor(width, height) {
        this.width = width;
        this.height = height;        
        this.buffer_size = this.width * this.height * 4;
    }

    newBuffer() {
        this.buffer = new Uint8ClampedArray(this.buffer_size);
    }

    drawBuffer(ctx) {
        ctx.putImageData(
            new ImageData(this.buffer, this.width, this.height),
            0, 0);
    }

    /**
     * independent variables are always integers
     * dependent values are always floats
     * 
     * @param {*} i0 independent variable start
     * @param {*} d0 dependent variable start
     * @param {*} i1 independent variable end
     * @param {*} d1 dependent variable start
     * @return {Array[float]} array of calculated values between d0 and d1
     */
    interpolate(i0, d0, i1, d1) {

        if (i0 == i1) {
            return [ d0 ];
        }

        var values = [];

        const a = (d1 - d0) / (i1 - i0);
        var d = d0;

        for (let i=i0; i<i1; i++) {
            values.push(d);
            d = d + a;
        }

        return values;
    }

    drawLine(p0, p1) {
        if (Math.abs(p1.x - p0.x) > Math.abs(p1.y - p0.y)) {
            // Line is horizontal-ish
            if (p0.x > p1.x) {
                let tmp = p1;
                p1 = p0;
                p0 = tmp;
            }

            var yvals = this.interpolate(p0.x, p0.y, p1.x, p1.y);

            for (let x=p0.x; x<p1.x; x++) {
                this.putPixel(x, yvals[x-p0.x]);
            }

        } else {
            // Line is vertical-ish
            if (p0.y > p1.y) {
                let tmp = p1;
                p1 = p0;
                p0 = tmp;
            }

            var xvals = this.interpolate(p0.y, p0.x, p1.y, p1.x);

            for (let y=p0.y; y<p1.y; y++) {
                this.putPixel(xvals[y-p0.y], y);
            }

        }
    }

    /**
     * Uses Pixel Manipulation on the Canvas
     * https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas
     * 
     * Buffer contains 4 byte values for every pixel and starts at 0.
     * pixel(x, y) = data[x*4 + y*width*4]
     * 
     **/
    putPixel(x, y) {

        // transform canvas co-ords to screen co-ords
        const sx = Math.round(this.width/2 + x);
        const sy = Math.round(this.height/2 - y);

        if (sx < 0 || sx >= this.width || sy < 0 || sy >= this.height) {
            console.error('pixel out of range');
            return;
        }

        var offset = 4 * sx + this.width*4 * sy;

        //console.log(x, y, offset);

        this.buffer[offset++] = 0;
        this.buffer[offset++] = 0;
        this.buffer[offset++] = 0;
        this.buffer[offset++] = 255; // Alpha = 255 (full opacity)        
    }
}