export interface RegistryItem {
  /**
   * 唯一标识符
   * Unique identifier for the plugin
   */
  id: string;

  /**
   * 名称，可以更改而不会破坏配置
   * Display Name, can change without breaking configs
   */
  name: string;

  /**
   * 类型
   * The type of plugin
   */
  type: string;

  /**
   * 描述
   * The description of the plugin
   */
  description?: string;

  /**
   * 别名，当ID更改时，我们可能需要向后兼容（'current' => 'last'）
   * when the ID changes, we may want backwards compatibility ('current' => 'last')
   */
  aliasIds?: string[];
}
