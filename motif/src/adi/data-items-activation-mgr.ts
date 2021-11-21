/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { assert, AssertInternalError, Logger, SysTick } from 'src/sys/internal-api';
import { DataItemId } from './common/internal-api';
import { DataItem } from './data-item';

export class DataItemsActivationMgr {

    public deactivationDelay: number;

    public beginMultipleActivationChangesEvent: DataItemsActivationMgr.MultipleActivationChangesHandler;
    public endMultipleActivationChangesEvent: DataItemsActivationMgr.MultipleActivationChangesHandler;

    private _nrActiveItems = 0;
    private _activeSubscriptionsLimit: number;
    private _wantActivationItems: DataItem[] = [];
    private _keepActivationItems = new DataItemsActivationMgr.DataItemMap();
    private _availableForDeactivationItems: DataItem[] = [];
    private _cacheDataSubscriptions: boolean;

    get activeSubscriptionsLimit(): number { return this._activeSubscriptionsLimit; }
    set activeSubscriptionsLimit(value: number) { this.setActiveSubscriptionsLimit(value); }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get cacheDataSubscriptions(): boolean { return this._cacheDataSubscriptions; }
    set cacheDataSubscriptions(value: boolean) { this.setCacheDataSubscriptions(value); }

    wantActivation(dataItem: DataItem) {
        if ((this._activeSubscriptionsLimit < 0) || (this._nrActiveItems < this._activeSubscriptionsLimit)) {
            dataItem.activate();
            this._nrActiveItems++;
            this._keepActivationItems.set(dataItem);
        } else {
            if (this._availableForDeactivationItems.length > 0) {
                this._availableForDeactivationItems[0].deactivate();
                this._availableForDeactivationItems.shift();
                dataItem.activate();
                this._keepActivationItems.set(dataItem);
            } else {
                this._wantActivationItems.push(dataItem);
                const msg = 'DataItem WantActivation Queued.  Channel: "'
                    + dataItem.channelName
                    + '" Subscriptions Active '
                    + this._nrActiveItems.toString(10)
                    + ' of '
                    + this._activeSubscriptionsLimit.toString(10);
                Logger.log(Logger.LevelId.Warning, msg);
            }
        }
    }

    cancelWantActivation(dataItem: DataItem) {
        console.assert(!dataItem.active, 'CancelWantActivation inactive DataItem');

        const Idx = this._wantActivationItems.indexOf(dataItem);
        if (Idx < 0) {
            console.assert(false, 'DataItemsActivationMgr.CancelWantActivation DataItem not found');
        } else {
            this._wantActivationItems.splice(Idx, 1);
        }
    }

    keepActivation(dataItem: DataItem) {
        const Idx = this._availableForDeactivationItems.indexOf(dataItem);

        if (Idx < 0) {
            console.assert(false, 'DataItemsActivationMgr.KeepActivation DataItem not found');
        } else {
            this._keepActivationItems.set(dataItem);
            this._availableForDeactivationItems.splice(Idx, 1);
            dataItem.notifyKeepActivation();
        }
    }

    availableForDeactivation(dataItem: DataItem) {
        console.assert(dataItem.active);

        let UntilTarget: SysTick.Time;

        if (!this._keepActivationItems.remove(dataItem)) {
            console.assert(false, 'DataItem not KeepActive!  Channel: "' + dataItem.channelName + '"');
        } else {
            const delay = this.deactivationDelay;
            const deactivationDelayed = this.cacheDataSubscriptions &&
                dataItem.definition.referencable &&
                (delay > 0) &&
                dataItem.online;

            if (!deactivationDelayed) {
                dataItem.deactivate();
                this._nrActiveItems--;
            } else {
                if (this._wantActivationItems.length > 0) {
                    dataItem.deactivate();
                    this._wantActivationItems[0].activate();
                    this._keepActivationItems.set(this._wantActivationItems[0]);
                    this._wantActivationItems.shift();
                } else {
                    this._availableForDeactivationItems.push(dataItem);
                    UntilTarget = SysTick.now() + delay;
                    dataItem.notifyDeactivationDelayed(UntilTarget);
                }
            }
        }
    }

    deactivateAvailable(dataItem: DataItem) {
        assert(dataItem.deactivationDelayed);
        const Idx = this._availableForDeactivationItems.indexOf(dataItem);
        if (Idx < 0) {
            throw new AssertInternalError('DIAMDA87766392', dataItem.definition.description);
        } else {
            this._availableForDeactivationItems.splice(Idx, 1);
            dataItem.deactivate();
        }
    }

    processWantQueue() {
        /*
        //   if FAllWantQueued then
        //   begin
        //     FAllWantQueued := False;
        //
        //     for I := 0 to FWantActivationItems.Count - 1 do
        //     begin
        //       DataItem := FWantActivationItems[I];
        //       if (FActiveSubscriptionsLimit < 0) or (FNrActiveItems < FActiveSubscriptionsLimit) then
        //       begin
        //         DataItem.Activate;
        //         Inc(FNrActiveItems);
        //         FKeepActivationItems.Add(DataItem);
        //         FWantActivationItems.Items[I] := nil;
        //       end
        //       else
        //       begin
        //         Services.Log(lmtWarning, 'DataItem WantActivation Queued.  Channel: "' +
        //                                   DataItem.ChannelName + '" Limit: ' + IntToStr(FActiveSubscriptionsLimit));
        //       end;
        //     end;
        //
        //     FWantActivationItems.Pack;
        //   end;
        */

        for (let index = this._wantActivationItems.length - 1; index >= 0; index--) {
            const dataItem: DataItem = this._wantActivationItems[index];
            if (this._activeSubscriptionsLimit < 0 || this._nrActiveItems < this._activeSubscriptionsLimit) {
                dataItem.activate();
                this._nrActiveItems++;
                this._keepActivationItems.set(dataItem);
                this._wantActivationItems.splice(index, 1);
            } else {
                const logMsg = 'DataItem WantActivation Queued.  Channel: "'
                    + dataItem.channelName
                    + '" Subscriptions Active '
                    + this._nrActiveItems.toString(10)
                    + ' of '
                    + this._activeSubscriptionsLimit.toString(10);
                Logger.log(Logger.LevelId.Warning, logMsg);
            }
        }
    }

    checkForDeactivations(nowTickTime: SysTick.Time) {
        /*
        //   if FAvailableForDeactivationItems.Count > 0 then
        //   begin
        //     ItemsToBeDeactivated := TDataItemList.Create;
        //     try
        //       for I := FAvailableForDeactivationItems.Count-1 downto 0 do
        //       begin
        //         if not FCacheDataSubscriptions
        //            or
        //            not FAvailableForDeactivationItems[I].HasDeactivationDelayExpired(NowTickCount)
        //            or
        //            not FAvailableForDeactivationItems[I].Online then
        //         begin
        //           ItemsToBeDeactivated.Add(FAvailableForDeactivationItems[I]);
        //           FAvailableForDeactivationItems.Delete(I);
        //           Dec(FNrActiveItems);
        //         end;
        //       end;
        //
        //       GotMultipleActivationChanges := (ItemsToBeDeactivated.Count > 1)
        //                                       or
        //                                       ((FWantActivationItems.Count > 0) and (ItemsToBeDeactivated.Count > 0))
        //                                       or
        //                                       (
        //                                         (FWantActivationItems.Count > 1)
        //                                         and
        //                                         ((FActiveSubscriptionsLimit < 0) or (FNrActiveItems < (FActiveSubscriptionsLimit-1)))
        //                                       );
        //
        //       if GotMultipleActivationChanges then
        //       begin
        //         FOnBeginMultipleActivationChanges;
        //       end;
        //
        //       try
        //         for I := 0 to ItemsToBeDeactivated.Count-1 do
        //         begin
        //           ItemsToBeDeactivated[I].Deactivate;
        //         end;
        //
        //         while (FWantActivationItems.Count > 0)
        //               and
        //               ((FActiveSubscriptionsLimit < 0) or (FNrActiveItems < FActiveSubscriptionsLimit)) do
        //         begin
        //           FWantActivationItems[0].Activate;
        //           FKeepActivationItems.Add(FWantActivationItems[0]);
        //           FWantActivationItems.Delete(0);
        //         end;
        //
        //       finally
        //         if GotMultipleActivationChanges then
        //         begin
        //           FOnEndMultipleActivationChanges;
        //         end;
        //       end;
        //
        //     finally
        //       ItemsToBeDeactivated.Free;
        //     end;
        //   end;
        */

        if (this._availableForDeactivationItems.length > 0) {
            const itemsToBeDeactivated: DataItem[] = [];
            for (let index = this._availableForDeactivationItems.length - 1; index >= 0; index--) {
                const dataItem: DataItem = this._availableForDeactivationItems[index];
                if (!this._cacheDataSubscriptions || dataItem.hasDeactivationDelayExpired(nowTickTime) || !dataItem.online) {
                    itemsToBeDeactivated.push(dataItem);
                    this._availableForDeactivationItems.splice(index, 1);
                    this._nrActiveItems--;
                }
            }

            const gotMultipleActivationChanges: boolean = (
                (itemsToBeDeactivated.length > 1)
                ||
                ((this._wantActivationItems.length > 0) && (itemsToBeDeactivated.length > 0))
                || (
                    (this._wantActivationItems.length > 1)
                    &&
                    ((this._activeSubscriptionsLimit < 0) || (this._nrActiveItems < (this._activeSubscriptionsLimit - 1)))
                )
            ) as boolean;

            if (gotMultipleActivationChanges) {
                this.beginMultipleActivationChangesEvent();
            }

            try {
                for (let index = 0; index < itemsToBeDeactivated.length; index++) {
                    itemsToBeDeactivated[index].deactivate();
                }

                while (true) {
                    const isOk: boolean = (
                        (this._wantActivationItems.length > 0)
                        &&
                        ((this._activeSubscriptionsLimit < 0) || (this._nrActiveItems < this._activeSubscriptionsLimit))
                    ) as boolean;

                    if (!isOk) {
                        break;
                    }

                    this._wantActivationItems[0].activate();
                    this._keepActivationItems.set(this._wantActivationItems[0]);
                    this._wantActivationItems.splice(0, 1);
                }
            } finally {
                if (gotMultipleActivationChanges) {
                    this.endMultipleActivationChangesEvent();
                }
            }
        }
    }

    private setActiveSubscriptionsLimit(Value: number) {
        this._activeSubscriptionsLimit = Value;
        if ((this._activeSubscriptionsLimit >= 0) && (this._activeSubscriptionsLimit < this._nrActiveItems)) {
            const NrAvailableForDeactivation = this._availableForDeactivationItems.length;
            if (NrAvailableForDeactivation > 0) {
                const NrWantToDeactivate = this._nrActiveItems - this._activeSubscriptionsLimit;
                let NrToDeactivate: number;
                if (NrWantToDeactivate <= NrAvailableForDeactivation) {
                    NrToDeactivate = NrWantToDeactivate;
                } else {
                    NrToDeactivate = NrAvailableForDeactivation;
                }

                const MultipleDeactivations = NrToDeactivate > 1;
                if (MultipleDeactivations) {
                    this.beginMultipleActivationChangesEvent();
                }
                try {
                    for (let I = 0; I < NrToDeactivate; I++) {
                        this._availableForDeactivationItems[0].deactivate();
                        this._availableForDeactivationItems.shift();
                    }
                    this._nrActiveItems -= NrToDeactivate;
                } finally {
                    if (MultipleDeactivations) {
                        this.endMultipleActivationChangesEvent();
                    }
                }
            }
        }
    }

    private setCacheDataSubscriptions(Value: boolean) {
        this._cacheDataSubscriptions = Value;
        if (!this._cacheDataSubscriptions) {
            this.checkForDeactivations(SysTick.now());
        }
    }
}

export namespace DataItemsActivationMgr {
    export type DelayDeactivationEventHandler = (this: void, DataItem: DataItem, Delay: number) => number;
    export type MultipleActivationChangesHandler = (this: void) => void;

    export class DataItemMap {
        private map = new Map<DataItemId, DataItem>();

        set(dataItem: DataItem) {
            this.map.set(dataItem.id, dataItem);
        }

        get(id: number): DataItem | undefined {
            return this.map.get(id);
        }

        remove(dataItem: DataItem): boolean {
            return this.map.delete(dataItem.id);
        }
    }
}
