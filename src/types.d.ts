export type HOC_Inject<InjectProps> = <Props extends InjectProps>(
  Component: React.ComponentType<Props>,
) => React.ComponentType<Omit<Props, keyof InjectProps>>;

export type HOC_Expand<ExpandProps> = <Props>(
  Component: React.ComponentType<Props>,
) => React.ComponentType<Props & ExpandProps>;
