import type { ScheduleUser } from './schedule-users';

const SLACK_USER_IDS: Partial<Record<ScheduleUser, string>> = {
  Arianne: 'U09944SQARM',
  Cassey: 'U8TB96N85',
  Em: 'U6VSAPRRU',
  Gaia: 'U9C3D8KMM',
  George: 'U04K4JCA2BT',
  Jaisa: 'U07LQUSSKB6',
  Jep: 'U04JS5UKPR8',
  John: 'U0603TXJW0G',
  Runnel: 'U03JCG706E6',
};

export function formatSlackMention(userName: ScheduleUser): string {
  const slackId = SLACK_USER_IDS[userName];
  return slackId ? `<@${slackId}>` : `@${userName}`;
}
