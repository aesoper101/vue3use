export interface RegistryItem {
  /**
   * 唯一标识符
   * Unique identifier for the plugin
   */
  readonly id: string;

  /**
   * 名称
   * Display Name
   */
  readonly name: string;

  /**
   * 类型
   * The type of plugin
   */
  readonly type: string;

  /**
   * 描述
   * The description of the plugin
   */
  readonly description?: string;

  /**
   * 别名，当ID更改时，我们可能需要向后兼容（'current' => 'last'）
   * when the ID changes, we may want backwards compatibility ('current' => 'last')
   */
  readonly aliasIds?: string[];
}
