import { Component } from 'vue';

export type VueComponent = Component & { $options: any };
