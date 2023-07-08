"use client";

import { Room } from "@/lib/schema";
import { Card, Title, Text } from "@tremor/react";
import { useEffect, useRef, useState } from "react";

const MAX_CANVAS_SIZE = 400;

export default function RoomtComponent() {
  const problemId = 1;
  const [room, setRoom] = useState<Room | null>(null);
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `https://cdn.icfpcontest.com/problems/${problemId}.json`
        );
        const room = Room.parse(await res.json());
        setRoom(room);
        console.log(room);
      } catch (e) {
        alert(JSON.stringify(e));
      }
    })();
  }, [problemId]);

  useEffect(() => {
    if (ref.current === null || room === null) {
      return;
    }
    const canvas = ref.current;

    const ctx = canvas.getContext("2d")!;

    // reset
    ctx.setTransform(1, 0, 0, 1, 0, 0);
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
      const circle = new Path2D();
      circle.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fill(circle);
    }
  }, [ref, room]);

  return (
    <Card className="mt-8">
      <Title>Hello, world</Title>
      <Text>This is Room!</Text>

      <canvas width={MAX_CANVAS_SIZE} height={MAX_CANVAS_SIZE} ref={ref} />
    </Card>
  );
}
