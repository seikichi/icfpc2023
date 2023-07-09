import { createCanvas, Canvas, DOMMatrix } from 'canvas'
import * as fs from 'fs';

const MAX_CANVAS_SIZE = 1000;
const NUM_PROBLEMS = 90;

for (let i = 1; i <= NUM_PROBLEMS; i++) {
    const room = JSON.parse(fs.readFileSync(`../../solver/problems/${i}.json`, 'utf8'));

    // canvasを作成します
    const canvas: Canvas = createCanvas(MAX_CANVAS_SIZE, MAX_CANVAS_SIZE);
    const ctx = canvas.getContext("2d")!;

    // reset
    ctx.setTransform(new DOMMatrix([1, 0, 0, 1, 0, 0]));
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // resize
    const ratio = MAX_CANVAS_SIZE / Math.max(room.room_width, room.room_height);
    canvas.width = room.room_width * ratio;
    canvas.height = room.room_height * ratio;

    ctx.scale(ratio, ratio);
    ctx.fillStyle = "gray";
    ctx.fillRect(0, 0, room.room_width, room.room_height);

    ctx.fillStyle = "green";
    const [stage_x, stage_y] = room.stage_bottom_left;
    ctx.fillRect(stage_x, stage_y, room.stage_width, room.stage_height);

    ctx.fillStyle = "red";
    for (const { x, y } of room.attendees) {
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fill();
    }

    ctx.fillStyle = "black";
    if (room.pillars) {
      for (const { center, radius } of room.pillars) {
        const [x, y] = center;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
      }
    }

    // PNG形式で保存します
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(`../../dashboard/public/problems/${i}.png`, buffer);
}
