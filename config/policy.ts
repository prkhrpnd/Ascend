export interface PolicyType {
  version: string;
  unit: string;
  tiers: number[];
  tierNeedsStressCycleFrom: number;
  maxStepMultiple: number;
  minHistoryMonths: number;
  capacityIncomeRatio: number;
  dependentIncomeWeight: number;
  bufferPaise: number;
  stress: {
    incomeDelayDays: number;
    earnedIncomeHaircut: number;
    variableSpendPercentile: number;
  };
  dueDateOffsetDays: number;
  cycleDays: number;
  utilisationAlert: number;
  coolingOffMinutes: number;
  pricing: {
    firstCycleInterestFree: boolean;
    monthlyInterestBps: number;
    lateFeePaise: number;
    penaltyInterest: number;
    ascendShareOfLateFee: number;
  };
  bureauReady: {
    cleanCycles: number;
    maxUtilisation: number;
    stressCyclesPassed: number;
  };
  risk: {
    dpd30Target: number;
    dpd30PullBackLimitIncreases: number;
    poolUsagePauseOnboarding: number;
  };
  rewards: {
    cashbackPaisePerOnTimeCycle: number;
    paysOnlyWhenOnTime: boolean;
  };
  invite: {
    rewardEachPaise: number;
    rewardTriggersOn: string;
    maxRewardsPerUser: number;
  };
  cluster: {
    name: string;
    colleges: string[];
  };
}

export interface ConfigChangeLog {
  id: string;
  field: string;
  oldValue: any;
  newValue: any;
  timestamp: string;
  reason: string;
}

export const DEFAULT_POLICY: PolicyType = {
  version: "hackathon-v1",
  unit: "paise",
  tiers: [50000, 150000, 300000, 500000],          // 500, 1500, 3000, 5000
  tierNeedsStressCycleFrom: 300000,                // reaching Rs 3000+ needs one passed stress cycle
  maxStepMultiple: 3,                              // 500 to 1500 is 3x, so allow 3
  minHistoryMonths: 3,
  capacityIncomeRatio: 0.20,                       // of median monthly qualifying inflow
  dependentIncomeWeight: 0.8,                      // parent money counts at 80%
  bufferPaise: 30000,                              // Rs 300 safety buffer
  stress: {
    incomeDelayDays: 7,                            // primary income arrives 7 days late
    earnedIncomeHaircut: 0.25,                     // tutoring income 25% lower
    variableSpendPercentile: 90                    // spend at P90 month
  },
  dueDateOffsetDays: 2,                            // due 2 days after primary income day
  cycleDays: 30,
  utilisationAlert: 0.6,
  coolingOffMinutes: 30,                           // repeated draws in a day trigger a pause
  pricing: {
    firstCycleInterestFree: true,
    monthlyInterestBps: 150,                       // 1.5% per 30-day cycle on utilised amount
    lateFeePaise: 5000,                            // flat Rs 50, one-time per missed cycle
    penaltyInterest: 0,                            // never compounding penalty interest
    ascendShareOfLateFee: 0                        // hard zero, no field to change it elsewhere
  },
  bureauReady: { cleanCycles: 6, maxUtilisation: 0.5, stressCyclesPassed: 1 },
  risk: { dpd30Target: 0.05, dpd30PullBackLimitIncreases: 0.08, poolUsagePauseOnboarding: 0.70 },
  rewards: { cashbackPaisePerOnTimeCycle: 1000, paysOnlyWhenOnTime: true },
  invite: { rewardEachPaise: 2500, rewardTriggersOn: "invitee_first_on_time_repayment", maxRewardsPerUser: 3 },
  cluster: { name: "National Student Eligibility Network", colleges: ["All Verified Higher Education Institutions", "Open Eligibility Track"] }
};

// Global active policy reference that can be updated dynamically
export let POLICY: PolicyType = JSON.parse(JSON.stringify(DEFAULT_POLICY));

export let CONFIG_LOGS: ConfigChangeLog[] = [
  {
    id: "init",
    field: "initial_setup",
    oldValue: null,
    newValue: DEFAULT_POLICY.version,
    timestamp: new Date().toISOString(),
    reason: "Initial Hackathon baseline loaded"
  }
];

export let LAST_UPDATE_REASON: string | null = null;

export function updatePolicy(newValues: Partial<PolicyType>, reason: string): PolicyType {
  const oldSnapshot = JSON.parse(JSON.stringify(POLICY));
  Object.keys(newValues).forEach((key) => {
    const k = key as keyof PolicyType;
    if (newValues[k] !== undefined) {
      CONFIG_LOGS.unshift({
        id: Math.random().toString(36).substring(2, 9),
        field: key,
        oldValue: oldSnapshot[k],
        newValue: newValues[k],
        timestamp: new Date().toISOString(),
        reason
      });
      (POLICY as any)[k] = newValues[k];
    }
  });
  LAST_UPDATE_REASON = reason;
  return POLICY;
}

export function resetPolicy(): void {
  POLICY = JSON.parse(JSON.stringify(DEFAULT_POLICY));
  LAST_UPDATE_REASON = null;
}
