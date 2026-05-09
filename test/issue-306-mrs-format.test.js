import { describe, it, expect } from 'vitest';
import yaml from 'js-yaml';
import { ClashConfigBuilder } from '../src/builders/ClashConfigBuilder.js';
import { generateClashRuleSets } from '../src/config/ruleGenerators.js';

const SS_INPUT = `
ss://YWVzLTEyOC1nY206dGVzdA@example.com:443#HK-Node-1
`;

describe('Clash rule providers use Loyalsoldier rules only', () => {
  it('should generate Loyalsoldier YAML providers instead of mrs providers', () => {
    const { site_rule_providers, ip_rule_providers } = generateClashRuleSets([], [], true);
    const providers = { ...site_rule_providers, ...ip_rule_providers };

    expect(providers.google).toMatchObject({
      type: 'http',
      behavior: 'domain',
      url: 'https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/google.txt',
      path: './ruleset/google.yaml'
    });
    expect(providers.google.format).toBeUndefined();
    expect(providers.google.url).not.toContain('MetaCubeX');
    expect(providers.google.url).not.toContain('.mrs');
  });

  it('should keep the same Loyalsoldier providers for legacy and modern clients', async () => {
    const userAgents = ['Clash/1.0', 'ClashForWindows/0.20.0', 'mihomo/1.18.0', 'clash-verge/v1.5.0'];

    for (const ua of userAgents) {
      const builder = new ClashConfigBuilder(SS_INPUT, [], [], null, 'zh-CN', ua);
      const yamlText = await builder.build();
      const config = yaml.load(yamlText);

      expect(config['rule-providers'].google.url).toBe('https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/google.txt');
      expect(config['rule-providers'].telegramcidr.behavior).toBe('ipcidr');
      expect(config['rule-providers'].google.format).toBeUndefined();
    }
  });
});
