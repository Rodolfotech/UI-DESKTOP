/**
 * Shared editor resolvers — single source of truth for Craft.js component
 * resolvers used by EditorArea and PreviewModal.
 *
 * By colocating all node/template imports here, Next.js can better
 * tree-shake and chunk the bundle. PreviewModal uses a lightweight
 * resolver import instead of duplicating all 20+ node imports.
 */

import type { UserComponent } from "@craftjs/core"
import { ContainerNode } from "@/components/editor/nodes/ContainerNode"
import { ButtonNode } from "@/components/editor/nodes/ButtonNode"
import { TextNode } from "@/components/editor/nodes/TextNode"
import { ImageNode } from "@/components/editor/nodes/ImageNode"
import { InputNode } from "@/components/editor/nodes/InputNode"
import { HeadingNode } from "@/components/editor/nodes/HeadingNode"
import { CardNode } from "@/components/editor/nodes/CardNode"
import { ModalNode } from "@/components/editor/nodes/ModalNode"
import { NavigationNode } from "@/components/editor/nodes/NavigationNode"
import { CheckboxNode } from "@/components/editor/nodes/CheckboxNode"
import { SelectNode } from "@/components/editor/nodes/SelectNode"
import { TextareaNode } from "@/components/editor/nodes/TextareaNode"
import { DividerNode } from "@/components/editor/nodes/DividerNode"
import { AvatarNode } from "@/components/editor/nodes/AvatarNode"
import { BadgeNode } from "@/components/editor/nodes/BadgeNode"
import { AlertNode } from "@/components/editor/nodes/AlertNode"
import { RadioNode } from "@/components/editor/nodes/RadioNode"
import { ToggleNode } from "@/components/editor/nodes/ToggleNode"
import { DatePickerNode } from "@/components/editor/nodes/DatePickerNode"
import { HeroTemplate } from "@/components/editor/templates/HeroTemplate"
import { PricingTemplate } from "@/components/editor/templates/PricingTemplate"
import { FooterTemplate } from "@/components/editor/templates/FooterTemplate"
import { FeaturesGrid } from "@/components/editor/templates/FeaturesGrid"
import { TestimonialTemplate } from "@/components/editor/templates/TestimonialTemplate"
import { LoginForm } from "@/components/editor/templates/LoginForm"
import { ContactForm } from "@/components/editor/templates/ContactForm"
import { TableOfContents } from "@/components/editor/templates/TableOfContents"
import { FAQSection } from "@/components/editor/templates/FAQSection"
import { TeamGrid } from "@/components/editor/templates/TeamGrid"
import { PricingTableDetailed } from "@/components/editor/templates/PricingTableDetailed"
import { StatsCounter } from "@/components/editor/templates/StatsCounter"
import { NewsletterSection } from "@/components/editor/templates/NewsletterSection"
import { CookieConsentBanner } from "@/components/editor/templates/CookieConsentBanner"
import { TimelineSection } from "@/components/editor/templates/TimelineSection"
import { LogoCloud } from "@/components/editor/templates/LogoCloud"
import { CTASection } from "@/components/editor/templates/CTASection"
import { PortfolioGrid } from "@/components/editor/templates/PortfolioGrid"

/**
 * Full resolver — all native components + templates.
 * Used by EditorArea.
 */
export const NATIVE_RESOLVERS: Record<string, UserComponent> = {
  ButtonNode,
  ContainerNode,
  TextNode,
  ImageNode,
  InputNode,
  HeadingNode,
  CardNode,
  ModalNode,
  NavigationNode,
  CheckboxNode,
  SelectNode,
  TextareaNode,
  DividerNode,
  AvatarNode,
  BadgeNode,
  AlertNode,
  RadioNode,
  ToggleNode,
  DatePickerNode,
  HeroTemplate,
  PricingTemplate,
  FooterTemplate,
  FeaturesGrid,
  TestimonialTemplate,
  LoginForm,
  ContactForm,
  TableOfContents,
  FAQSection,
  TeamGrid,
  PricingTableDetailed,
  StatsCounter,
  NewsletterSection,
  CookieConsentBanner,
  TimelineSection,
  LogoCloud,
  CTASection,
  PortfolioGrid,
}

/**
 * Minimal resolver — only the basic components needed for rendering previews.
 * Excludes heavy templates to reduce preview chunk size.
 */
export const PREVIEW_RESOLVERS: Record<string, UserComponent> = {
  ButtonNode,
  ContainerNode,
  TextNode,
  ImageNode,
  InputNode,
  HeadingNode,
  CardNode,
  ModalNode,
  NavigationNode,
  CheckboxNode,
  SelectNode,
  TextareaNode,
  DividerNode,
  AvatarNode,
  BadgeNode,
  AlertNode,
  RadioNode,
  ToggleNode,
  DatePickerNode,
  HeroTemplate,
  PricingTemplate,
  FooterTemplate,
  FeaturesGrid,
  TestimonialTemplate,
}
