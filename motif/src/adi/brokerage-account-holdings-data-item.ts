/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { AssertInternalError, Integer, Logger, UnreachableCaseError, UsableListChangeTypeId } from 'src/sys/internal-api';
import { BrokerageAccountGroupHoldingList } from './brokerage-account-group-holding-list';
import { AurcChangeTypeId, DataMessage, DataMessageTypeId, HoldingsDataMessage } from './common/internal-api';
import { DataRecordsBrokerageAccountSubscriptionDataItem } from './data-records-brokerage-account-subscription-data-item';
import { Holding } from './holding';

export class BrokerageAccountHoldingsDataItem extends DataRecordsBrokerageAccountSubscriptionDataItem<Holding>
    implements BrokerageAccountGroupHoldingList {

    processMessage(msg: DataMessage) { // virtual;
        if (msg.typeId !== DataMessageTypeId.Holdings) {
            super.processMessage(msg);
        } else {
            this.beginUpdate();
            try {
                if (!(msg instanceof HoldingsDataMessage)) {
                    throw new AssertInternalError('HDIPM26674499', msg.constructor.name);
                } else {
                    this.advisePublisherResponseUpdateReceived();
                    this.notifyUpdateChange();
                    this.processHoldingsMessage(msg);
                }

            } finally {
                this.endUpdate();
            }
        }
    }

    private checkApplyAdd(holdingChangeRecords: readonly HoldingsDataMessage.ChangeRecord[],
        addStartMsgIdx: Integer, endPlus1MsgIdx: Integer
    ) {
        if (addStartMsgIdx >= 0) {
            const account = this.account;
            if (account === undefined) {
                throw new AssertInternalError('BAHDICAAA888234235');
            } else {
                const addCount = endPlus1MsgIdx - addStartMsgIdx;
                const addStartIdx = this.extendRecordCount(addCount);
                let addIdx = addStartIdx;
                for (let i = addStartMsgIdx; i < endPlus1MsgIdx; i++) {
                    const changeRec = holdingChangeRecords[i];
                    const changeData = changeRec.data;
                    if (!HoldingsDataMessage.isAddChangeData(changeRec, changeData)) {
                        throw new AssertInternalError('BAHDICAAC7777754');
                    } else {
                        if (!HoldingsDataMessage.isMarketChangeData(changeData)) {
                            throw new AssertInternalError('BAHDICHM3888234235');
                        } else {
                            const holding = new Holding(account, changeData, this.correctnessId);
                            this.setRecord(addIdx++, holding);
                        }
                    }
                }

                this.checkUsableNotifyListChange(UsableListChangeTypeId.Insert, addStartIdx, addCount);
            }
        }

        return -1;
    }

    private processHoldingsMessage(msg: HoldingsDataMessage) {
        let addStartMsgIdx = -1;

        const msgRecordLength = msg.holdingChangeRecords.length;
        for (let msgHoldingIdx = 0; msgHoldingIdx < msgRecordLength; msgHoldingIdx++) {
            const cr = msg.holdingChangeRecords[msgHoldingIdx];
            switch (cr.typeId) {
                case AurcChangeTypeId.Add:
                    const addChangeData = cr.data as HoldingsDataMessage.AddUpdateChangeData;
                    const addMapKey = Holding.Key.generateMapKey(addChangeData.exchangeId,
                        addChangeData.code, addChangeData.accountId, addChangeData.environmentId);
                    if (this.hasRecord(addMapKey)) {
                        addStartMsgIdx = this.checkApplyAdd(msg.holdingChangeRecords, addStartMsgIdx, msgHoldingIdx);
                        Logger.logDataError('HDIPOMA38877',
                            `${addChangeData.exchangeId}, ${addChangeData.code}, ${addChangeData.accountId}`);
                    } else {
                        if (addStartMsgIdx < 0) {
                            addStartMsgIdx = msgHoldingIdx;
                        }
                    }
                    break;

                case AurcChangeTypeId.Update:
                    addStartMsgIdx = this.checkApplyAdd(msg.holdingChangeRecords, addStartMsgIdx, msgHoldingIdx);
                    const updateChangeData = cr.data as HoldingsDataMessage.AddUpdateChangeData;
                    const updateMapKey = Holding.Key.generateMapKey(updateChangeData.exchangeId,
                        updateChangeData.code, updateChangeData.accountId, updateChangeData.environmentId);
                    const updateHolding = this.getRecordByMapKey(updateMapKey);

                    if (updateHolding === undefined) {
                        Logger.logDataError('HDIPOMAU11776', `${updateChangeData.accountId}`);
                    } else {
                        if (!HoldingsDataMessage.isMarketChangeData(updateChangeData)) {
                            throw new AssertInternalError('BAHDIPHM13888234235');
                        } else {
                            updateHolding.update(updateChangeData);
                        }
                    }
                    break;

                case AurcChangeTypeId.Remove:
                    addStartMsgIdx = this.checkApplyAdd(msg.holdingChangeRecords, addStartMsgIdx, msgHoldingIdx);
                    const removeChangeData = cr.data as HoldingsDataMessage.RemoveChangeData;
                    const removeMapKey = Holding.Key.generateMapKey(removeChangeData.exchangeId, removeChangeData.code,
                        removeChangeData.accountId, removeChangeData.environmentId);
                    const holdingIdx = this.indexOfRecordByMapKey(removeMapKey);
                    if (holdingIdx < 0) {
                        Logger.logDataError('HDIPOMR74332', `Holding not found: ${JSON.stringify(removeChangeData)}`);
                    } else {
                        this.checkUsableNotifyListChange(UsableListChangeTypeId.Remove, holdingIdx, 1);
                        this.removeRecord(holdingIdx);
                    }
                    break;

                case AurcChangeTypeId.Clear:
                    addStartMsgIdx = this.checkApplyAdd(msg.holdingChangeRecords, addStartMsgIdx, msgHoldingIdx);
                    this.clearRecords();
                    break;
                default:
                    throw new UnreachableCaseError('HDIPMOD44691', cr.typeId);
            }
        }
        this.checkApplyAdd(msg.holdingChangeRecords, addStartMsgIdx, msg.holdingChangeRecords.length);
    }
}
