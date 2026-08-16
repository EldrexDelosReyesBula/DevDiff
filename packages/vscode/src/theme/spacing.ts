export class Spacing {
  /**
   * VS Code uses a 4px grid. DevDiff follows it exactly.
   * No arbitrary values. Consistent rhythm everywhere.
   */
  static readonly GRID = 4;

  static readonly XS = 2; // 2px — tightest spacing
  static readonly SM = 4; // 4px — compact
  static readonly MD = 8; // 8px — standard
  static readonly LG = 12; // 12px — comfortable
  static readonly XL = 16; // 16px — section spacing
  static readonly XXL = 24; // 24px — large separation
  static readonly XXXL = 32; // 32px — page-level spacing

  /**
   * VS Code's standard font sizes
   */
  static readonly FONT_XS = "11px";
  static readonly FONT_SM = "12px";
  static readonly FONT_MD = "13px"; // VS Code default
  static readonly FONT_LG = "14px";
  static readonly FONT_XL = "16px";

  /**
   * VS Code's standard border radius
   */
  static readonly RADIUS_NONE = "0";
  static readonly RADIUS_SM = "2px";
  static readonly RADIUS_MD = "4px";

  /**
   * VS Code's standard line heights
   */
  static readonly LINE_TIGHT = "1.4";
  static readonly LINE_NORMAL = "1.6";
  static readonly LINE_LOOSE = "1.8";
}
