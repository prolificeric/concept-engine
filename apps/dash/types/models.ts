export interface Space {
  id: string;
  name: string;
}

export interface Account {
  id: string;
  billingId: string;
  created: Date;
  trialDaysLeft: number;
  level: string;
}
