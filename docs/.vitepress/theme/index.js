import './style.css';

import DefaultTheme from 'vitepress/theme';
import Layout from './Layout.vue';
import Page from '../components/Page.vue';
import OutlineComponent from '../components/shared/outline/Outline.vue';
import OutlineItem from '../components/shared/outline/OutlineItem.vue';
import AccordionComponent from './../components/shared/Accordion.vue';
import AnchorLinkComponent from './../components/shared/AnchorLink.vue';
import ArrowComponent from './../components/shared/Arrow.vue';
import DisconnectIcon from './../components/shared/DisconnectIcon.vue';
// import TypeRendererComponent from './../components/shared/type/components/TypeRenderer.vue';
// import ArrayTypeComponent from './../components/shared/type/components/ArrayType.vue';
import GetProviderStateComponent from './../components/snippets/GetProviderState.vue';

import GetComplexStateAndPrefixedSecondComponent from './../components/snippets/GetComplexStateAndPrefixedSecond.vue';
import ComputeSmthComponent from './../components/snippets/ComputeSmth.vue';
import GetFieldsComponent from './../components/snippets/GetFields.vue';
import TvmExceptionComponent from './../components/snippets/TvmException.vue';

// Working with cells snippets
import PackCellComponent from './../components/snippets/PackCell.vue';
import UnpackCellComponent from './../components/snippets/UnpackCell.vue';
import GetBocHashComponent from './../components/snippets/GetBocHash.vue';
import ExtractPKComponent from './../components/snippets/ExtractPK.vue';
import MergeSplitTvcComponent from './../components/snippets/MergeSplitTvc.vue';
import CodeToTvcComponent from './../components/snippets/CodeToTvc.vue';
import GetSetSaltComponent from './../components/snippets/GetSetSalt.vue';
import GetExpectedAddressComponent from './../components/snippets/GetExpectedAddress.vue';

// Working with contracts snippets
import DeployAccountComponent from './../components/snippets/DeployAccount.vue';
import SendExternalMessageComponent from './../components/snippets/SendExternalMessage.vue';
import SendInternalMessageComponent from './../components/snippets/SendInternalMessage.vue';
import SendInternalDelayedMessageComponent from './../components/snippets/SendInternalDelayedMessage.vue';
import SendExternalDelayedMessageComponent from './../components/snippets/SendExternalDelayedMessage.vue';
import ContractInfoComponent from './../components/snippets/shared/ContractInfo.vue';
import RunLocalComponent from './../components/snippets/RunLocal.vue';
import ExecuteLocalComponent from './../components/snippets/ExecuteLocal.vue';

// Subscriptions snippets
import ProviderEventsComponent from './../components/snippets/ProviderEvents.vue';
import BlockchainEventsComponent from './../components/snippets/BlockchainEvents.vue';
import ListenContractEventsComponent from './../components/snippets/ListenContractEvents.vue';
import GetPastEventsComponent from './../components/snippets/GetPastEvents.vue';
import SubscriberTxComponent from './../components/snippets/SubscriberTx.vue';
import SubscriberStateComponent from './../components/snippets/SubscriberState.vue';
import SubscriberTraceComponent from './../components/snippets/SubscriberTrace.vue';

// Cryptography snippets
import EncryptDecryptComponent from './../components/snippets/EncryptDecrypt.vue';
import SignDataComponent from './../components/snippets/SignData.vue';
import VerifySignComponent from './../components/snippets/VerifySign.vue';
import DecodeTransactionComponent from './../components/snippets/DecodeTransaction.vue';
import DecodeEventComponent from './../components/snippets/DecodeEvent.vue';
import DecodeInputMsgComponent from './../components/snippets/DecodeInputMsg.vue';
import DecodeOutputMsgComponent from './../components/snippets/DecodeOutputMsg.vue';

import ToastComponent from './../components/shared/Toast.vue';

export default {
  ...DefaultTheme,
  Layout: Layout,
  enhanceApp({ app }) {
    DefaultTheme.enhanceApp({ app });
    // app.component('Layout', Layout);
    app.component('Page', Page);
    app.component('OutlineComponent', OutlineComponent);
    app.component('OutlineItem', OutlineItem);
    app.component('LinkComponent', AnchorLinkComponent);
    app.component('ArrowComponent', ArrowComponent);
    app.component('AccordionComponent', AccordionComponent);
    app.component('DisconnectIcon', DisconnectIcon);

    app.component('GetProviderStateComponent', GetProviderStateComponent);
    app.component('GetComplexStateAndPrefixedSecondComponent', GetComplexStateAndPrefixedSecondComponent);
    app.component('ComputeSmthComponent', ComputeSmthComponent);
    app.component('GetFieldsComponent', GetFieldsComponent);
    app.component('TvmExceptionComponent', TvmExceptionComponent);

    // Working with cells snippets
    app.component('PackCellComponent', PackCellComponent);
    app.component('UnpackCellComponent', UnpackCellComponent);
    app.component('GetBocHashComponent', GetBocHashComponent);
    app.component('ExtractPKComponent', ExtractPKComponent);
    app.component('MergeSplitTvcComponent', MergeSplitTvcComponent);
    app.component('CodeToTvcComponent', CodeToTvcComponent);
    app.component('GetSetSaltComponent', GetSetSaltComponent);
    app.component('GetExpectedAddressComponent', GetExpectedAddressComponent);

    // Working with contracts snippets
    app.component('DeployAccountComponent', DeployAccountComponent);
    app.component('SendExternalMessageComponent', SendExternalMessageComponent);
    app.component('SendInternalMessageComponent', SendInternalMessageComponent);
    app.component('SendInternalDelayedMessageComponent', SendInternalDelayedMessageComponent);
    app.component('SendExternalDelayedMessageComponent', SendExternalDelayedMessageComponent);
    app.component('ContractInfoComponent', ContractInfoComponent);
    app.component('RunLocalComponent', RunLocalComponent);
    app.component('ExecuteLocalComponent', ExecuteLocalComponent);

    // Subscriptions snippets
    app.component('ProviderEventsComponent', ProviderEventsComponent);
    app.component('BlockchainEventsComponent', BlockchainEventsComponent);
    app.component('ListenContractEventsComponent', ListenContractEventsComponent);
    app.component('GetPastEventsComponent', GetPastEventsComponent);
    app.component('SubscriberTxComponent', SubscriberTxComponent);
    app.component('SubscriberStateComponent', SubscriberStateComponent);
    app.component('SubscriberTraceComponent', SubscriberTraceComponent);

    // Cryptography snippets
    app.component('EncryptDecryptComponent', EncryptDecryptComponent);
    app.component('SignDataComponent', SignDataComponent);
    app.component('VerifySignComponent', VerifySignComponent);
    app.component('DecodeTransactionComponent', DecodeTransactionComponent);
    app.component('DecodeEventComponent', DecodeEventComponent);
    app.component('DecodeInputMsgComponent', DecodeInputMsgComponent);
    app.component('DecodeOutputMsgComponent', DecodeOutputMsgComponent);

    app.component('ToastComponent', ToastComponent);
  },
};
