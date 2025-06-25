import { render, screen } from "@testing-library/react";
import { Button } from "./button";
import { test, expect } from "vitest";

test("Button component renders correctly", () => {
  render(<Button>Click me</Button>);
  const buttonElement = screen.getByText(/Click me/i);
  expect(buttonElement).toBeInTheDocument();
});