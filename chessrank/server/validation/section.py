import validation

from datetime import datetime
from bson.objectid import ObjectId
from util.enums import (SectionRegistrationAction, PlaySystem, TimeControlBonus,
                        TieBreak, SectionOwnerAction, RoundStatus)

class SectionCaptureValidator(validation.Validator):
    def __init__(self, data):
        super().__init__(data)

        self._required = {
            'action': self._verify_action,
            'round': self._verify_positive_integer,
            'results': lambda field, value: (True, None), # TODO
            'finalize': lambda field, value: (True, None), # TODO
        }

    def _verify_positive_integer(self, field, value):
        return ((True, None) if type(value) == int and value > 0
                else (False, "Field '{0}' must be a positive integer".format(field)))

    def _verify_action(self, field, value):
        return ((True, None) if value == SectionOwnerAction.capture_results
                else (False, "Field '{0}' must be equal to {1}"
                      .format(field, int(SectionOwnerAction.capture_results))))

    def validate(self):
        spurious = set(self._data.keys()) - set(self._required.keys())
        if spurious:
            return (False, "Spurious fields included in request: {0}"
                    .format(', '.join(spurious)))

        return self._verify_required_fields()

    def _verify_required_fields(self):
        missing  = set(self._required.keys()) - set(self._data.keys())
        if missing:
            return (False, "Required field '{0}' missing"
                    .format(next(iter(missing))))

        for field in self._required:
            validate = self._required[field]
            result = validate(field, self._data[field])
            if not result[0]:
                return result

        return (True, None)

class SectionPairingValidator(validation.Validator):
    def __init__(self, data):
        super().__init__(data)

        self._required = {
            'action': self._verify_action,
            'round': self._verify_positive_integer
        }

    def _verify_positive_integer(self, field, value):
        return ((True, None) if type(value) == int and value > 0
                else (False, "Field '{0}' must be a positive integer".format(field)))

    def _verify_action(self, field, value):
        return ((True, None) if value == SectionOwnerAction.pair_round
                else (False, "Field '{0}' must be equal to {1}"
                      .format(field, int(SectionOwnerAction.pair_round))))

    def validate(self):
        spurious = set(self._data.keys()) - set(self._required.keys())
        if spurious:
            return (False, "Spurious fields included in request: {0}"
                    .format(', '.join(spurious)))

        return self._verify_required_fields()

    def _verify_required_fields(self):
        missing  = set(self._required.keys()) - set(self._data.keys())
        if missing:
            return (False, "Required field '{0}' missing"
                    .format(next(iter(missing))))

        for field in self._required:
            validate = self._required[field]
            result = validate(field, self._data[field])
            if not result[0]:
                return result

        return (True, None)

class SectionRegistrationValidator(validation.Validator):
    def __init__(self, data):
        super().__init__(data)

    def validate(self):
        spurious = set(self._data.keys()) - {'action'}
        if spurious:
            return (False, "Spurious fields included in request: {0}"
                    .format(', '.join(spurious)))

        action = self._data.get('action', None)
        if action is None:
            return (False, "Required field 'action' missing")

        if action not in set(SectionRegistrationAction):
            return (False, "Field 'action' must be either 0 or 1")

        return (True, None)

class SectionUpdateValidator(validation.Validator):
    def __init__(self, data):
        super().__init__(data)

        self._required = {
            'name': self._verify_name,
            'startDate': self._verify_start_and_end_dates,
            'endDate': lambda field, value: (True, None),
            'registrationStartDate': self._verify_registration_dates,
            'registrationEndDate': lambda field, value: (True, None),
            'playSystem': self._verify_play_system,
            'timeControls': self._verify_time_controls,
            'tieBreaks': self._verify_tie_breaks,
            'rounds': self._verify_positive_integer,
            'maxPlayers': self._verify_positive_integer,
            'chiefArbiter': self._verify_name,
            'provisionalRating': self._verify_positive_integer,
            'registrationFee': self._verify_non_negative_number,
            'invitationOnly': self._verify_boolean,
            'registeredPlayerIds': self._verify_list_of_objectids,
            'confirmedPlayerIds': self._verify_list_of_objectids,
            'tournamentId': self._verify_objectid,
            'registrationManuallyClosed': self._verify_nullable_date,
            'roundData': self._verify_list_of_rounds,
            'playerData': lambda field, value: (True, None) # TODO
        }

    def validate(self):
        spurious = set(self._data.keys()) - set(self._required.keys())
        if spurious:
            return (False, "Spurious fields included in request: {0}"
                    .format(', '.join(spurious)))

        return self._verify_required_fields()

    def _verify_required_fields(self):
        missing  = set(self._required.keys()) - set(self._data.keys())
        if missing:
            return (False, "Required field '{0}' missing"
                    .format(next(iter(missing))))

        for field in self._required:
            validate = self._required[field]
            result = validate(field, self._data[field])
            if not result[0]:
                return result

        return (True, None)

    def _verify_name(self, field, value):
        return ((True, None) if type(value) == str
                and len(value) > 1 and len(value) < 51
                else (False, "Field '{0}' must be between 2 and 50 characters long".format(field)))

    def _verify_start_and_end_dates(self, field, value):
        beg = self._data['startDate']
        end = self._data['endDate']

        return ((True, None) if beg < end
            else (False, "Field 'startDate' must be earlier than field 'endDate'"))

    def _verify_registration_dates(self, field, value):
        beg = self._data['startDate']
        end = self._data['endDate']
        reg_beg = self._data['registrationStartDate']
        reg_end = self._data['registrationEndDate']

        return ((True, None) if reg_beg < reg_end and reg_beg < beg and reg_end < end
            else (False, "Field 'registrationStartDate' must be earlier than field "
            + "'registrationEndDate' and field 'startDate'. Also, field "
            + "'registrationEndDate' must be earlier than field 'endDate'"))

    def _verify_play_system(self, field, value):
        return ((True, None) if value in list(PlaySystem)
                else (False, "Field '{0}' must be an integer between 1 and 3".format(field)))

    def _verify_time_controls(self, field, value):
        if type(value) != list:
            return (False, "Field '{0}' must be an array".format(field))

        for i in range(0, len(value)):
            item = value[i]

            keys = ['moves', 'period', 'bonus', 'bonusType']
            missing  = set(keys) - set(item.keys())
            if missing:
                return (False, "Required property '{0}' of item {1} of field '{2}' missing"
                        .format(next(iter(missing)), i+1, field))

            moves = item['moves']
            period = item['period']
            bonus = item['bonus']
            bonusType = item['bonusType']

            if moves < -1:
                return (False, "Property 'moves' of item {0} of field '{1}' must be greater than -2"
                        .format(i+1, field))

            if period < 1:
                return (False, "Property 'period' of item {0) field '{1}' must be a positive integer"
                        .format(i+1, field))

            if bonus < 0:
                return (False, "Property 'bonus' of item {0} of field '{1}' may not be negative"
                        .format(i+1, field))

            if bonusType not in list(TimeControlBonus):
                return (False, "Property 'bonusType' of item {0} of field '{0}' must be either 1 or 2"
                        .format(i+1, field))

        return (True, None)

    def _verify_tie_breaks(self, field, value):
        if type(value) != list:
            return (False, "Field '{0}' must be an array".format(field))

        for i in range(0, len(value)):
            item = value[i]
            if item not in list(TieBreak):
                return ((False, "Field '{0}' of item {1} must be an integer between 0 and 3"
                         .format(field, i+1)))

        return (True, None)

    def _verify_positive_integer(self, field, value):
        return ((True, None) if type(value) == int and value > 0
                else (False, "Field '{0}' must be a positive integer".format(field)))

    def _verify_non_negative_number(self, field, value):
        return ((True, None) if type(value) in (float, int)
                and value >= 0
                else (False, "Field '{0}' must be a non-negative number".format(field)))

    def _verify_boolean(self, field, value):
        return ((True, None) if type(value) == bool
                else (False, "Field '{0}' must be a boolean".format(field)))

    def _verify_objectid(self, field, value):
        return ((True, None) if type(value) == ObjectId
                else (False, "Field '{0}' must be a valid ObjectId".format(field)))

    def _verify_list_of_objectids(self, field, value):
        if type(value) != list:
            return (False, "Field '{0}' must be an array".format(field))

        for i in range(0, len(value)):
            item = value[i]
            if not type(item) == ObjectId:
                return (False, "Item {0} of field '{1}' must be a valid ObjectId"
                        .format(i, field))

        return (True, None)

    def _verify_nullable_date(self, field, value):
        return ((True, None) if value is None or type(value) == datetime
                else (False, "Field '{0}' must be a valid BSON date object or null".format(field)))

    def _verify_list_of_rounds(self, field, value):
        if type(value) != list:
            return (False, "Field '{0}' must be an array".format(field))

        for i in range(0, len(value)):
            item = value[i]
            if type(item.get('startTime')) != datetime:
                return (False, "'startTime' field of item {0} of field '{1}' must be a valid BSON date object"
                        .format(i, field))

            status = item.get('status')
            if status not in list(RoundStatus):
                return (False, "'status' field of item {0} of field '{1}' must be one of {2}"
                        .format(i, field, [int(t) for t in list(RoundStatus)]))

        return (True, None)
