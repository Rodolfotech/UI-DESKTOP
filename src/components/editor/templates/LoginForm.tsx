"use client"

import React from "react"
import { useNode, useEditor, Element, UserComponent } from "@craftjs/core"
import { cn } from "@/lib/utils"
import { ContainerNode } from "../nodes/ContainerNode"
import { HeadingNode } from "../nodes/HeadingNode"
import { TextNode } from "../nodes/TextNode"
import { ButtonNode } from "../nodes/ButtonNode"
import { InputNode } from "../nodes/InputNode"

export interface LoginFormProps {
  title?: string
  subtitle?: string
  buttonText?: string
  background?: string
}

export const LoginForm: UserComponent<LoginFormProps> = ({
  title = "Welcome Back",
  subtitle = "Sign in to your account",
  buttonText = "Sign In",
  background = "#ffffff",
}) => {
  const {
    connectors: { connect, drag },
    selected,
    hovered,
  } = useNode((state) => ({
    selected: state.events.selected,
    hovered: state.events.hovered,
  }))

  return (
    <div
      ref={(ref) => { if (ref) connect(drag(ref)) }}
      className={cn(
        "flex items-center justify-center py-12 px-4",
        selected && "ring-2 ring-blue-500 ring-offset-2",
        hovered && !selected && "ring-2 ring-blue-300 ring-offset-1"
      )}
      style={{ background, minHeight: "450px" }}
    >
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <Element is={HeadingNode} text={title} level="h2" color="#111827" />
          <div className="mt-2">
            <Element is={TextNode} text={subtitle} fontSize={14} color="#6b7280" />
          </div>
        </div>
        <div className="space-y-4">
          <Element is={InputNode} label="Email" placeholder="you@example.com" type="email" />
          <Element is={InputNode} label="Password" placeholder="••••••••" type="password" />
          <div className="pt-2">
            <Element is={ButtonNode} text={buttonText} variant="default" size="lg" />
          </div>
        </div>
        <div className="mt-6 text-center">
          <Element is={TextNode} text="Don't have an account? Sign up" fontSize={13} color="#6b7280" />
        </div>
      </div>
    </div>
  )
}

export const LoginFormSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({
    props: node.data.props as LoginFormProps,
  }))

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
        <input type="text" value={props.title || "Welcome Back"} onChange={(e) => setProp((p: LoginFormProps) => (p.title = e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtitle</label>
        <input type="text" value={props.subtitle || ""} onChange={(e) => setProp((p: LoginFormProps) => (p.subtitle = e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Button Text</label>
        <input type="text" value={props.buttonText || "Sign In"} onChange={(e) => setProp((p: LoginFormProps) => (p.buttonText = e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Background</label>
        <input type="color" value={props.background || "#ffffff"} onChange={(e) => setProp((p: LoginFormProps) => (p.background = e.target.value))} className="w-full h-10 border border-gray-300 rounded-md" />
      </div>
    </div>
  )
}

LoginForm.craft = {
  displayName: "Login Form",
  props: {
    title: "Welcome Back",
    subtitle: "Sign in to your account",
    buttonText: "Sign In",
    background: "#ffffff",
  } as LoginFormProps,
  related: { settings: LoginFormSettings },
  rules: { canDrag: () => true },
}
