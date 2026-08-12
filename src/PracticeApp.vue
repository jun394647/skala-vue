<script setup>
import SampleOne from './components/practices/basic/SampleOne.vue'
import SampleTwo from './components/practices/basic/SampleTwo.vue'

import VueHtml from './components/practices/basic/VueHtml.vue'
import VueHtmlXss from './components/practices/basic/VueHtmlXss.vue'
import VueText from './components/practices/basic/VueText.vue'
import VueBind from './components/practices/basic/VueBind.vue'
import VueBindClass from './components/practices/basic/VueBindClass.vue'
import VueBindStyle from './components/practices/basic/VueBindStyle.vue'
import VueBindShorthand from './components/practices/basic/VueBindShorthand.vue'
import VueIf from './components/practices/basic/VueIf.vue'
import VueShow from './components/practices/basic/VueShow.vue'
import VueFor from './components/practices/basic/VueFor.vue'
import VuePre from './components/practices/basic/VuePre.vue'
import VueCloak from './components/practices/basic/VueCloak.vue'
import VueOnce from './components/practices/basic/VueOnce.vue'
import VueMemo from './components/practices/basic/VueMemo.vue'

import EventBasic from './components/practices/basic/EventBasic.vue'
import EventObject from './components/practices/basic/EventObject.vue'
import EventModifier from './components/practices/basic/EventModifier.vue'

import ModelBasic from './components/practices/basic/ModelBasic.vue'
import ModelForm from './components/practices/basic/ModelForm.vue'
import ModelModifier from './components/practices/basic/ModelModifier.vue'

import StyleScoped from './components/practices/basic/StyleScoped.vue'

import ReactiveRef from './components/practices/composition/ReactiveRef.vue'
import ReactiveReactive from './components/practices/composition/ReactiveReactive.vue'
import ComputedBasic from './components/practices/composition/ComputedBasic.vue'
import WatchersBasic from './components/practices/composition/WatchersBasic.vue'
import WatchersDeep from './components/practices/composition/WatchersDeep.vue'
import WatchersMulti from './components/practices/composition/WatchersMulti.vue'
import WatchersReactive from './components/practices/composition/WatchersReactive.vue'
import WatchersReactiveArray from './components/practices/composition/WatchersReactiveArray.vue'
import WatchersRefArray from './components/practices/composition/WatchersRefArray.vue'
import WatchersWatchEffect from './components/practices/composition/WatchersWatchEffect.vue'

import PropsEmitsParent from './components/practices/component/PropsEmitsParent.vue'
import SlotDefaultParent from './components/practices/component/SlotDefaultParent.vue'
import SlotNamedParent from './components/practices/component/SlotNamedParent.vue'
import SlotScopedParent from './components/practices/component/SlotScopedParent.vue'
import LifecycleParent from './components/practices/component/LifecycleParent.vue'

import AxiosJson from './components/practices/library/AxiosJson.vue'
import AxiosWeather from './components/practices/library/AxiosWeather.vue'
import EcmaScript from './components/practices/library/EcmaScript.vue'
import ElementPlus from './components/practices/library/ElementPlus.vue'
import StoreCounter from './components/practices/library/StoreCounter.vue'
</script>

<template>
  <div class="practice-container">
    <h1>1. 학습환경구성</h1>
    <hr />
    <SampleOne />
    <SampleTwo />
    <h1>2. Vue Directive</h1>
    <hr />
    <VueHtml />
    <VueHtmlXss />
    <VueText />
    <VueBind />
    <VueBindClass />
    <VueBindStyle />
    <VueBindShorthand />
    <VueIf />
    <VueShow />
    <VueFor />
    <VuePre />
    <VueCloak />
    <VueOnce />
    <VueMemo />
    <h1>3. Vue Event Handling</h1>
    <hr />
    <EventBasic />
    <EventObject />
    <EventModifier />
    <h1>4. Vue Form Handling</h1>
    <hr />
    <ModelBasic />
    <ModelForm />
    <ModelModifier />
    <h1>5. Vue Style Handling</h1>
    <hr />
    <StyleScoped />
    <h1>6. Composition API</h1>
    <hr />
    <ReactiveRef />
    <ReactiveReactive />
    <ComputedBasic />
    <WatchersBasic />
    <WatchersDeep />
    <WatchersMulti />
    <WatchersReactive />
    <WatchersReactiveArray />
    <WatchersRefArray />
    <WatchersWatchEffect />
    <h1>7. Vue Component</h1>
    <hr />
    <PropsEmitsParent />
    <SlotDefaultParent />
    <SlotNamedParent />
    <SlotScopedParent />
    <LifecycleParent />
    <h1>8. Library 활용</h1>
    <hr />
    <AxiosJson />
    <AxiosWeather />
    <EcmaScript />
    <ElementPlus />
    <StoreCounter />
  </div>
</template>

<style>
@import '@/assets/practice.css';
</style>
