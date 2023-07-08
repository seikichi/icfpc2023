"use client";

import { Room, Solution } from "@/lib/schema";
import { Card, Title, Flex, Button } from "@tremor/react";
import { useCallback, useEffect, useRef, useState } from "react";
import wasm, { calculate } from "wasm";

const MAX_CANVAS_SIZE = 1000;

export default function RoomtComponent() {
  const problemId = 42;

  const [room, setRoom] = useState<Room | null>(null);
  const [solution, setSolution] = useState<Solution | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    if (room === null || solution === null) {
      return;
    }
    console.log("start calculate");
    (async () => {
      try {
        await wasm();
        const score = calculate(
          JSON.stringify(room),
          JSON.stringify({
            placements: solution.placements.map(({ x, y }) => [x, y]),
          })
        );
        console.log(score);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [room, solution]);

  useEffect(() => {
    if (canvasRef.current === null || room === null) {
      return;
    }
    const canvas = canvasRef.current;

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

    if (solution === null) {
      return;
    }

    ctx.fillStyle = "blue";
    for (const { x, y } of solution.placements) {
      const circle = new Path2D();
      circle.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fill(circle);
    }
  }, [canvasRef, room, solution]);

  const clearSolution = useCallback(() => {
    setSolution(null);
  }, [setSolution]);

  const selectSolutin = useCallback(() => {
    if (inputRef.current === null) {
      return;
    }
    inputRef.current.click();
  }, [inputRef]);

  const onSolutionChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files![0];
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target!.result as string;
          const solution = Solution.parse(JSON.parse(text));
          setSolution(solution);
          console.log(solution);
        } catch (e) {
          alert(JSON.stringify(e));
        }
      };
      reader.readAsText(file);
    },
    []
  );

  return (
    <Card className="mt-8">
      <Title>Problem: {problemId}</Title>

      <canvas
        width={MAX_CANVAS_SIZE}
        height={MAX_CANVAS_SIZE}
        ref={canvasRef}
      />

      <Flex justifyContent="end" className="space-x-2 border-t pt-4 mt-8">
        <Button size="xs" variant="secondary" onClick={clearSolution}>
          Clear Solution
        </Button>

        <input
          type="file"
          onChange={onSolutionChange}
          ref={inputRef}
          style={{ display: "none" }}
        />

        <Button size="xs" variant="primary" onClick={selectSolutin}>
          Select Solution
        </Button>
      </Flex>
    </Card>
  );
}
