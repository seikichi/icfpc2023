"use client";

import { Card, Title, Text } from "@tremor/react";
import { useEffect, useRef } from "react";

const room = {
  room_width: 1000,
  room_height: 1000,
  stage_width: 148,
  stage_height: 169,
  stage_bottom_left: [529, 621],
  musicians: [0, 1, 0, 0, 1],
  attendees: [
    { x: 663, y: 171, tastes: [-856, -95] },
    { x: 410, y: 475, tastes: [-583, -12] },
    { x: 66, y: 302, tastes: [-6, -150] },
    { x: 993, y: 163, tastes: [807, -210] },
    { x: 255, y: 807, tastes: [-39, 461] },
    { x: 235, y: 475, tastes: [394, 971] },
    { x: 700, y: 739, tastes: [-946, 698] },
    { x: 955, y: 400, tastes: [396, 713] },
    { x: 396, y: 155, tastes: [746, -75] },
    { x: 806, y: 40, tastes: [947, 366] },
    { x: 337, y: 468, tastes: [-619, 356] },
    { x: 8, y: 235, tastes: [-5, 51] },
    { x: 924, y: 174, tastes: [266, -105] },
    { x: 979, y: 344, tastes: [63, -602] },
    { x: 789, y: 535, tastes: [-952, 985] },
    { x: 705, y: 632, tastes: [655, -248] },
    { x: 934, y: 0, tastes: [215, 754] },
    { x: 323, y: 592, tastes: [-577, 537] },
    { x: 979, y: 820, tastes: [259, -613] },
    { x: 225, y: 870, tastes: [988, -40] },
    { x: 72, y: 223, tastes: [500, 543] },
    { x: 59, y: 461, tastes: [-265, -463] },
    { x: 446, y: 859, tastes: [30, -177] },
    { x: 23, y: 154, tastes: [218, -538] },
    { x: 540, y: 799, tastes: [725, 520] },
    { x: 829, y: 589, tastes: [-423, 906] },
    { x: 157, y: 725, tastes: [439, -632] },
    { x: 401, y: 74, tastes: [525, -978] },
    { x: 930, y: 548, tastes: [723, -31] },
    { x: 93, y: 402, tastes: [484, -626] },
    { x: 868, y: 436, tastes: [-426, 510] },
    { x: 764, y: 638, tastes: [985, -476] },
    { x: 812, y: 957, tastes: [-924, 255] },
    { x: 456, y: 738, tastes: [64, 397] },
    { x: 110, y: 99, tastes: [914, -561] },
    { x: 720, y: 255, tastes: [-287, 386] },
    { x: 402, y: 743, tastes: [972, 299] },
    { x: 735, y: 871, tastes: [-165, -590] },
    { x: 421, y: 301, tastes: [31, -224] },
    { x: 226, y: 733, tastes: [-560, -15] },
    { x: 843, y: 497, tastes: [783, 857] },
    { x: 15, y: 588, tastes: [426, 39] },
    { x: 632, y: 811, tastes: [564, 961] },
    { x: 823, y: 187, tastes: [956, 429] },
    { x: 366, y: 728, tastes: [-13, 525] },
    { x: 706, y: 15, tastes: [99, 232] },
    { x: 440, y: 107, tastes: [-781, -136] },
    { x: 470, y: 685, tastes: [-435, -889] },
    { x: 593, y: 851, tastes: [-510, 714] },
    { x: 836, y: 145, tastes: [-393, 205] },
    { x: 422, y: 557, tastes: [66, -8] },
    { x: 992, y: 789, tastes: [177, -981] },
    { x: 464, y: 118, tastes: [942, 695] },
    { x: 369, y: 441, tastes: [-203, 997] },
    { x: 726, y: 482, tastes: [-728, 980] },
    { x: 161, y: 390, tastes: [662, -759] },
    { x: 840, y: 658, tastes: [-504, -247] },
    { x: 792, y: 124, tastes: [-548, -587] },
    { x: 107, y: 953, tastes: [-838, 92] },
    { x: 31, y: 612, tastes: [318, -325] },
    { x: 986, y: 390, tastes: [379, -64] },
    { x: 548, y: 380, tastes: [845, 221] },
    { x: 366, y: 114, tastes: [-706, 929] },
    { x: 783, y: 417, tastes: [966, 427] },
    { x: 216, y: 718, tastes: [767, -232] },
    { x: 907, y: 629, tastes: [-404, -238] },
    { x: 70, y: 112, tastes: [-216, 402] },
    { x: 240, y: 111, tastes: [-165, 719] },
    { x: 57, y: 659, tastes: [-101, -137] },
    { x: 937, y: 503, tastes: [462, 404] },
    { x: 964, y: 981, tastes: [-312, 570] },
    { x: 538, y: 426, tastes: [858, -492] },
    { x: 670, y: 117, tastes: [-949, 94] },
    { x: 412, y: 910, tastes: [598, 48] },
    { x: 648, y: 167, tastes: [-657, 806] },
    { x: 693, y: 663, tastes: [131, -422] },
    { x: 936, y: 384, tastes: [-214, 720] },
    { x: 922, y: 425, tastes: [-165, 168] },
    { x: 706, y: 650, tastes: [-490, -539] },
    { x: 47, y: 452, tastes: [440, 736] },
    { x: 249, y: 5, tastes: [-517, -339] },
    { x: 13, y: 437, tastes: [-44, -130] },
    { x: 997, y: 446, tastes: [-167, -364] },
    { x: 353, y: 610, tastes: [972, 899] },
    { x: 367, y: 667, tastes: [302, -372] },
    { x: 24, y: 855, tastes: [871, -620] },
    { x: 774, y: 574, tastes: [552, -545] },
    { x: 544, y: 35, tastes: [-220, -908] },
    { x: 365, y: 990, tastes: [-350, 707] },
    { x: 255, y: 91, tastes: [459, -63] },
    { x: 5, y: 782, tastes: [-637, -525] },
    { x: 200, y: 997, tastes: [270, 259] },
    { x: 311, y: 804, tastes: [65, -951] },
    { x: 503, y: 312, tastes: [-691, 210] },
    { x: 745, y: 207, tastes: [295, -426] },
    { x: 482, y: 736, tastes: [-32, 349] },
    { x: 605, y: 491, tastes: [-487, 617] },
    { x: 687, y: 597, tastes: [-168, 386] },
    { x: 457, y: 856, tastes: [103, -772] },
    { x: 860, y: 126, tastes: [618, 240] },
  ],
  pillars: [],
};

export default function Roomt() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (ref.current === null) {
      return;
    }
    const canvas = ref.current;

    const ctx = canvas.getContext("2d")!;

    // reset
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.scale(400 / 1000.0, 400 / 1000.0);
    ctx.fillStyle = "gray";
    ctx.fillRect(0, 0, room.room_width, room.room_height);

    ctx.fillStyle = "green";
    const [stage_x, stage_y] = room.stage_bottom_left;
    ctx.fillRect(stage_x, stage_y, room.stage_width, room.stage_height);

    ctx.fillStyle = "red";
    for (const { x, y } of room.attendees) {
      const circle = new Path2D();
      circle.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fill(circle);
    }
  }, [ref]);

  return (
    <Card className="mt-8">
      <Title>Hello, world</Title>
      <Text>This is Room!</Text>

      <canvas width="400" height="400" ref={ref} />
    </Card>
  );
}
