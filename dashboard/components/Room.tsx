"use client";

import { Room, Solution } from "@/lib/schema";
import { Card, Title, Flex, Button, Text } from "@tremor/react";
import { useCallback, useEffect, useRef, useState } from "react";
import wasm, { calculate, calculate_score_of_a_musician, attendee_importance } from "wasm";

const MAX_CANVAS_SIZE = 1000;

export type RoomtComponentProps = {
  problemId: number;
  solution: Solution | null;
  setSolution: (solution: Solution | null) => void;
};

export default function RoomtComponent(props: RoomtComponentProps) {
  const { problemId, solution, setSolution } = props;

  const [room, setRoom] = useState<Room | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [score, setScore] = useState<number | null>(null);
  const [musician_scores, setMusiciansScores] = useState<number[] | null>(null);
  const [attendee_importances, setAttendeeImportances] = useState<number[] | null>(null);

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
      const room_str = JSON.stringify(room);
      const solution_str = JSON.stringify({
        placements: solution.placements.map(({ x, y }) => [x, y]),
      });
      try {
        await wasm();

        const score = calculate(room_str, solution_str, problemId);
        setScore(Number(score));

        const musician_scores = room.musicians.map((_, i) => {
          const score_of_a_musician = calculate_score_of_a_musician(
            room_str,
            solution_str,
            problemId,
            i
          );
          return score_of_a_musician.reduce((a, b) => a + Number(b), 0);
        });
        console.log(
          "musician_scores:",
          solution.placements.map(({ x, y }, i) => {
            return { x, y, score: musician_scores[i] };
          })
        );
        setMusiciansScores(musician_scores);

        const room_str_ = JSON.stringify({
          size: [room.room_width, room.room_height],
          stage_pos: room.stage_bottom_left,
          stage_size: [room.stage_width, room.stage_height],
        });
        const attendee_importances = room.attendees.map((attendee, i) => {
          const attendee_str = JSON.stringify(attendee);
          return attendee_importance(attendee_str, room_str_);
        });
        setAttendeeImportances(attendee_importances);
      } catch (e) {
        alert(JSON.stringify(e));
      }
    })();
  }, [room, solution, problemId]);

  function mapValueToColor(value: number, min: number, max: number) {
    let r, g, b;
    if (value > 0) {
      // 0から正の範囲で青色の濃度を増やす
      let ratio = value / max;
      r = g = 255 * (1 - ratio);
      b = 255;
    } else if (value < 0) {
      // 0から負の範囲で赤色の濃度を増やす
      let ratio = value / min;
      r = 255;
      g = b = 255 * (1 - ratio);
    } else {
      // 値が0の場合は白色
      r = g = b = 255;
    }
    return (
      "rgb(" + Math.round(r) + "," + Math.round(g) + "," + Math.round(b) + ")"
    );
  }

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

    room.attendees.forEach(({ x, y }, i) => {
      if (attendee_importances === null) {
        ctx.fillStyle = "red";
      } else {
        const color = mapValueToColor(
          attendee_importances[i],
          Math.min(...attendee_importances),
          Math.max(...attendee_importances)
        );
        ctx.fillStyle = color;
      }
      const circle = new Path2D();
      circle.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fill(circle);
    });

    ctx.fillStyle = "black";
    if (room.pillars) {
      for (const { center, radius } of room.pillars) {
        const [x, y] = center;
        const circle = new Path2D();
        circle.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill(circle);
      }
    }

    if (solution === null) {
      return;
    }

    solution.placements.forEach(({ x, y }, i) => {
      if (musician_scores === null) {
        ctx.fillStyle = "white";
      } else {
        const color = mapValueToColor(
          musician_scores[i],
          Math.min(...musician_scores),
          Math.max(...musician_scores)
        );
        ctx.fillStyle = color;
      }
      const circle = new Path2D();
      circle.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fill(circle);
    });
  }, [canvasRef, room, solution, musician_scores]);

  const clearSolution = useCallback(() => {
    setSolution(null);
    setScore(null);
    setMusiciansScores(null);
  }, [setSolution]);

  const selectSolution = useCallback(() => {
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
          setScore(null);
          console.log(solution);
        } catch (e) {
          alert(JSON.stringify(e));
        }
      };
      reader.readAsText(file);
    },
    [setSolution]
  );

  return (
    <Card className="mt-8">
      <Title>Problem: {problemId}</Title>
      {score && <Text>Score: {score}</Text>}

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

        <Button size="xs" variant="primary" onClick={selectSolution}>
          Select Solution
        </Button>
      </Flex>
    </Card>
  );
}
