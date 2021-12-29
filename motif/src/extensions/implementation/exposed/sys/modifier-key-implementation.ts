import { ModifierKey, ModifierKeyId, UnreachableCaseError } from '@motifmarkets/motif-core';
import { ModifierKey as ModifierKeyApi, ModifierKeyEnum as ModifierKeyEnumApi } from '../../../api/extension-api';

export namespace ModifierKeyImplementation {
    export function toApi(value: ModifierKeyId): ModifierKeyApi {
        switch (value) {
            case ModifierKeyId.Alt: return ModifierKeyEnumApi.Alt;
            case ModifierKeyId.Ctrl: return ModifierKeyEnumApi.Ctrl;
            case ModifierKeyId.Meta: return ModifierKeyEnumApi.Meta;
            case ModifierKeyId.Shift: return ModifierKeyEnumApi.Shift;
            default: throw new UnreachableCaseError('UAAIRSTITA58843322', value);
        }
    }

    export function setToApi(value: ModifierKey.IdSet) {
        const result = new Array<ModifierKeyApi>(4);
        let count = 0;
        if (ModifierKey.idSetIncludes(value, ModifierKeyId.Alt)) {
            result[count++] = ModifierKeyEnumApi.Alt;
        }
        if (ModifierKey.idSetIncludes(value, ModifierKeyId.Ctrl)) {
            result[count++] = ModifierKeyEnumApi.Ctrl;
        }
        if (ModifierKey.idSetIncludes(value, ModifierKeyId.Meta)) {
            result[count++] = ModifierKeyEnumApi.Meta;
        }
        if (ModifierKey.idSetIncludes(value, ModifierKeyId.Shift)) {
            result[count++] = ModifierKeyEnumApi.Shift;
        }
        result.length = count;
        return result;
    }
}
