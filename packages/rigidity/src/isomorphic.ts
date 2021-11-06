import {
  useContext as useClientContext,
  createContext as createClientContext,
  Show as ClientShow,
  mergeProps as clientMergeProps,
  createSignal as createClientSignal,
  createEffect as createClientEffect,
  createMemo as createClientMemo,
  createComputed as createClientComputed,
  onCleanup as onClientCleanup,
  onMount as onClientMount,
} from 'solid-js';
import {
  useContext as useServerContext,
  createContext as createServerContext,
  Show as ServerShow,
  mergeProps as serverMergeProps,
  createSignal as createServerSignal,
  createEffect as createServerEffect,
  createMemo as createServerMemo,
  createComputed as createServerComputed,
  onCleanup as onServerCleanup,
  onMount as onServerMount,
} from 'solid-js/dist/server.cjs';

declare const RIGIDITY_SERVER: boolean;

export const isServer = typeof RIGIDITY_SERVER === 'boolean';

export const createSignal = typeof RIGIDITY_SERVER === 'boolean'
  ? createServerSignal
  : createClientSignal;

export const createEffect = typeof RIGIDITY_SERVER === 'boolean'
  ? createServerEffect
  : createClientEffect;

export const createMemo = typeof RIGIDITY_SERVER === 'boolean'
  ? createServerMemo
  : createClientMemo;

export const createComputed = typeof RIGIDITY_SERVER === 'boolean'
  ? createServerComputed
  : createClientComputed;

export const onCleanup = typeof RIGIDITY_SERVER === 'boolean'
  ? onServerCleanup
  : onClientCleanup;

export const onMount = typeof RIGIDITY_SERVER === 'boolean'
  ? onServerMount
  : onClientMount;

export const useContext = typeof RIGIDITY_SERVER === 'boolean'
  ? useServerContext
  : useClientContext;

export const createContext = typeof RIGIDITY_SERVER === 'boolean'
  ? createServerContext
  : createClientContext;

export const mergeProps = typeof RIGIDITY_SERVER === 'boolean'
  ? serverMergeProps
  : clientMergeProps;

export const Show = typeof RIGIDITY_SERVER === 'boolean'
  ? ServerShow
  : ClientShow;
