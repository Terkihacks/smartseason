const AT_RISK_DAYS = 60;
const MS_PER_DAY = 86_400_000;

const STAGE_ORDER = Object.freeze(['PLANTED', 'GROWING', 'READY', 'HARVESTED']);
const Stage = Object.freeze(Object.fromEntries(STAGE_ORDER.map(s => [s, s])));

function daysSincePlanting(plantingDate) {
  const ms = Date.now() - new Date(plantingDate).getTime();
  if (isNaN(ms)) throw new TypeError(`Invalid plantingDate: ${plantingDate}`);
  return Math.floor(ms / MS_PER_DAY);
}

function computeStatus(field) {
  if (field.stage === Stage.HARVESTED) return 'COMPLETED';

  const atRiskStages = new Set([Stage.PLANTED, Stage.GROWING]);
  if (atRiskStages.has(field.stage) && daysSincePlanting(field.plantingDate) > AT_RISK_DAYS) {
    return 'AT_RISK';
  }

  return 'ACTIVE';
}

function withStatus(field) {
  const days = daysSincePlanting(field.plantingDate);
  return {
    ...field,
    status: computeStatus(field),
    daysSincePlanting: days,
  };
}

function isForwardStage(current, next) {
  const currentIdx = STAGE_ORDER.indexOf(current);
  const nextIdx = STAGE_ORDER.indexOf(next);

  if (currentIdx === -1) throw new RangeError(`Unknown stage: "${current}"`);
  if (nextIdx === -1) throw new RangeError(`Unknown stage: "${next}"`);

  return nextIdx > currentIdx;
}

module.exports = {
  AT_RISK_DAYS,
  MS_PER_DAY,
  Stage,
  STAGE_ORDER,
  daysSincePlanting,
  computeStatus,
  withStatus,
  isForwardStage,
};