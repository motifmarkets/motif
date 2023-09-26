/**
 * @license Motif
 * (c) 2021 Paritech Wealth Technology
 * License: motionite.trade/license/motif
 */

import { ContentFrame } from '../content-frame';

export class ReportFrame extends ContentFrame {

}

export namespace ReportFrame {
    export const enum ReportFrameTypeId {
        rpftCompany, rpftDividends, rpftDilutions, rpftTechnicalAnalysis, rpftCashFlow, rpftBalanceSheet, rpftProfitAndLoss
    }

}
