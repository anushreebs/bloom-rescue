import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
const output = path.resolve('../artifacts/ui-redesign');

for (const viewport of [{width:1440,height:1000},{width:768,height:1024},{width:390,height:844},{width:320,height:812}]) {
  test(`redesigned workspace at ${viewport.width}px: reflow, accessible content, clean console`,async({page})=>{
    const errors:string[]=[];
    page.on('pageerror',error=>errors.push(error.message));
    page.on('console',message=>{if(message.type()==='error') errors.push(message.text());});
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page.getByText('Deterministic evidence mode',{exact:true})).toBeVisible();
    await expect(page.getByRole('heading',{name:'Recovery queue',exact:true})).toBeVisible();
    await expect(page.getByRole('button').filter({hasText:'Fable Labs'})).toBeVisible();
    await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.getByRole('button').filter({hasText:'Paper Orbit'}).click();
    await expect(page.getByRole('heading',{name:'Review the blocking question'})).toBeFocused();
    await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await page.evaluate(async()=>{
      await Promise.all(document.getAnimations().filter(a=>a.effect?.getTiming().iterations!==Infinity).map(a=>a.finished.catch(()=>undefined)));
    });
    const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    mkdirSync(output,{recursive:true});
    writeFileSync(path.join(output,`axe-${viewport.width}.json`),JSON.stringify({viewport,browser:page.context().browser()?.version(),violations:scan.violations,incomplete:scan.incomplete.map(v=>v.id)},null,2));
    expect(scan.violations).toEqual([]);
    await page.screenshot({path:path.join(output,`review-${viewport.width}.png`),fullPage:true});
    expect(errors).toEqual([]);
  });
}

test('reduced motion suppresses decorative animations and keyboard activation retains review focus',async({page})=>{
  await page.setViewportSize({width:320,height:812});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  await expect(page.getByText('Deterministic evidence mode',{exact:true})).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link',{name:'Skip to recovery workspace'})).toBeFocused();
  await page.keyboard.press('Enter');
  const card=page.getByRole('button').filter({hasText:'Paper Orbit'});
  await card.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading',{name:'Review the blocking question'})).toBeFocused();
  const motion=await page.evaluate(()=>Array.from(document.querySelectorAll('*')).flatMap(el=>{
    const style=getComputedStyle(el);
    const durations=style.animationDuration.split(',').map(v=>parseFloat(v)*(v.trim().endsWith('ms')?1:1000));
    return style.animationName==='none'?[]:durations.filter(duration=>duration>1);
  }));
  expect(motion).toEqual([]);
  await page.getByRole('button').filter({hasText:'Moss Studio'}).focus();
  for(let i=0;i<4;i++) await page.keyboard.press('Tab');
  const last=page.getByRole('button').filter({hasText:'Lantern Demo'});
  await expect(last).toBeFocused();
  const box=await last.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x+box!.width).toBeLessThanOrEqual(320);
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading',{name:'Review the blocking question'})).toBeFocused();
});

test('motion recording of actual fictional recovery workflow',async({browser})=>{
  test.skip(process.env.UI_RECORD_DEMO !== '1','Run separately against a fresh demo backend with UI_RECORD_DEMO=1.');
  const context=await browser.newContext({viewport:{width:1440,height:1000},recordVideo:{dir:output,size:{width:1440,height:1000}}});
  const page=await context.newPage();
  await page.goto('http://127.0.0.1:5173/');
  await expect(page.getByText('Deterministic evidence mode',{exact:true})).toBeVisible();
  await page.waitForTimeout(800);
  await page.screenshot({path:path.join(output,'queue-desktop.png'),fullPage:true});
  await page.getByRole('button').filter({hasText:'Fable Labs'}).click();
  await page.waitForTimeout(650);
  await page.getByRole('button',{name:'Generate evidence draft'}).click();
  await expect(page.getByLabel('Answer for your review')).toBeVisible();
  await page.waitForTimeout(1000);
  await page.screenshot({path:path.join(output,'supported-draft-desktop.png'),fullPage:true});
  await page.getByRole('button',{name:'Approve answer',exact:true}).click();
  await expect(page.getByRole('button',{name:'Resume mock application'})).toBeVisible();
  await page.waitForTimeout(700);
  await page.getByRole('button',{name:'Resume mock application'}).click();
  await expect(page.getByRole('heading',{name:'Submitted to the mock ATS',exact:true})).toBeVisible();
  await page.waitForTimeout(1200);
  await page.getByRole('button').filter({hasText:'Lantern Demo'}).click();
  await page.getByRole('button',{name:'Generate evidence draft'}).click();
  await expect(page.getByLabel('Answer for your review')).toBeVisible();
  await page.getByRole('button',{name:'Approve answer',exact:true}).click();
  await page.getByRole('button',{name:'Resume mock application'}).click();
  await expect(page.getByRole('heading',{name:'Check before retrying'})).toBeVisible();
  await page.waitForTimeout(1300);
  await page.screenshot({path:path.join(output,'uncertain-desktop.png'),fullPage:true});
  await page.getByRole('button',{name:'Check submission status',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Submitted to the mock ATS',exact:true})).toBeVisible();
  await page.waitForTimeout(1000);
  const video=page.video();
  await context.close();
  await video?.saveAs(path.join(output,'motion-demo.webm'));
});
