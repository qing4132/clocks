export type LabExperiment = {
  id: number;
  slug: string;
  nameEn: string;
  description: string;
  mechanism: string;
  reading: string;
  status: string;
  position: number;
  batch: number;
  face?: "round" | "none";
  clip?: "svg" | "card";
};

export type ClockTime = {
  date: Date;
  h24: number;
  h12: number;
  minuteValue: number;
  secondValue: number;
  ms: number;
  second: number;
  minute: number;
  hour: number;
  day: number;
};