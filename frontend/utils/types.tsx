export type Job = {
  _id: string;
  title: string;
  status: 'on' | 'off';
  jobCount: number;
  rejectionCount: number;
  createdAt: string;
};

export type Machine = {
  _id: string;
  machineName: string;
  machineType: string;
  jobList: Record<string, string>[];
  createdAt: string;
};
