const AT_RISK_DAYS = 60;
const MS_PER_DAY = 86_400_000;

function daysSincePlanting(plantingDate) {
  return Math.floor((Date.now() - new Date(plantingDate).getTime()) / MS_PER_DAY);
}

function computeStatus(field) {
  if (field.stage === 'HARVESTED') return 'COMPLETED';
  const days = daysSincePlanting(field.plantingDate);
  if ((field.stage === 'PLANTED' || field.stage === 'GROWING') && days > AT_RISK_DAYS) {
    return 'AT_RISK';
  }
  return 'ACTIVE';
}

function withStatus(field) {
  return { ...field, status: computeStatus(field), daysSincePlanting: daysSincePlanting(field.plantingDate) };
}

const STAGE_ORDER = ['PLANTED', 'GROWING', 'READY', 'HARVESTED'];

function isForwardStage(current, next) {
  return STAGE_ORDER.indexOf(next) > STAGE_ORDER.indexOf(current);
}

module.exports = {
  AT_RISK_DAYS,
  daysSincePlanting,
  computeStatus,
  withStatus,
  STAGE_ORDER,
  isForwardStage,
};
