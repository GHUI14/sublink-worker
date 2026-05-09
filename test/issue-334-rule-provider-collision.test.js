import { describe, it, expect } from 'vitest';
import yaml from 'js-yaml';
import { ClashConfigBuilder } from '../src/builders/ClashConfigBuilder.js';

const SS_INPUT = `
ss://YWVzLTEyOC1nY206dGVzdA@example.com:443#HK-Node-1
ss://YWVzLTEyOC1nY206dGVzdA@example.com:444#US-Node-1
`;

describe('Clash fixed Loyalsoldier provider set', () => {
  it('should include domain, ipcidr, and classical providers from Loyalsoldier only', async () => {
    const builder = new ClashConfigBuilder(SS_INPUT, 'balanced', [], null, 'zh-CN', 'mihomo/1.0');
    const yamlText = await builder.build();
    const config = yaml.load(yamlText);
    const providers = config['rule-providers'];

    expect(providers.google.behavior).toBe('domain');
    expect(providers.telegramcidr.behavior).toBe('ipcidr');
    expect(providers.applications.behavior).toBe('classical');

    Object.values(providers).forEach(provider => {
      expect(provider.url).toContain('Loyalsoldier/clash-rules@release');
      expect(provider.url).not.toContain('MetaCubeX');
    });
  });

  it('should not generate MetaCubeX rule-provider keys from selected rules', async () => {
    const builder = new ClashConfigBuilder(SS_INPUT, 'balanced', [], null, 'zh-CN', 'mihomo/1.0');
    const yamlText = await builder.build();
    const config = yaml.load(yamlText);
    const providers = config['rule-providers'];

    expect(providers['google-ip']).toBeUndefined();
    expect(providers.cn).toBeUndefined();
    expect(providers['cn-ip']).toBeUndefined();
    expect(providers['geolocation-!cn']).toBeUndefined();
    expect(yamlText).not.toContain('MetaCubeX');
    expect(yamlText).not.toContain('geosite:');
  });

  it('rules should follow Loyalsoldier whitelist order and route proxy rules to the proxy policy', async () => {
    const builder = new ClashConfigBuilder(SS_INPUT, [], [], null, 'zh-CN', 'mihomo/1.0');
    const yamlText = await builder.build();
    const config = yaml.load(yamlText);
    const proxyPolicy = config.rules.at(-1).split(',')[1];

    expect(config.rules[0]).toBe('RULE-SET,applications,DIRECT');
    expect(config.rules).toContain(`RULE-SET,google,${proxyPolicy}`);
    expect(config.rules).toContain(`RULE-SET,proxy,${proxyPolicy}`);
    expect(config.rules).toContain('RULE-SET,lancidr,DIRECT');
    expect(config.rules).toContain('RULE-SET,cncidr,DIRECT');
    expect(config.rules.at(-1)).toBe(`MATCH,${proxyPolicy}`);
  });
});
