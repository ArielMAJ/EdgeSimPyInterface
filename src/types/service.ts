type MigrationData = {
  status: string;
  origin: string | null;
  target: string | null;
  start: number | null;
  end: number | null;
  waiting: number | null;
  pulling: number | null;
  migr_state: number | null;
};

export type ServiceState = {
  Object: string;
  "Time Step": number;
  "Instance ID": number;
  Available: boolean;
  Server: number | null;
  "Being Provisioned": boolean;
  "Last Migration": MigrationData | null;
};

export type ServiceData = {
  Service: ServiceState[];
};
