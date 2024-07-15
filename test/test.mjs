import { parse } from "../index.mjs";
import { test, run, assertEqual } from "./framework/index.mjs";

test("parse", t => {
  /*
   * Tests from the CommonMark spec:
   * https://spec.commonmark.org/0.31.2/#emphasis-and-strong-emphasis
   */

  function assertParse(t, orig, expected) {
    assertEqual(t, parse(orig), expected, `For ${orig}`);
  }

  // Rule 1
  assertParse(t, `*foo bar*`, `<p><em>foo bar</em></p>`);
  assertParse(t, `a * foo bar*`, `<p>a * foo bar*</p>`);
  // assertParse(t, `a*"foo"*`, `<p>a*&quot;foo&quot;*</p>`); // TODO: HTML escapes
  assertParse(t, `* a *`, `<p>* a *</p>`);
  assertParse(t, `*$*alpha.`, `<p>*$*alpha.</p>`);
  assertParse(t, `*£*bravo.`, `<p>*£*bravo.</p>`);
  assertParse(t, `*€*charlie.`, `<p>*€*charlie.</p>`);
  assertParse(t, `foo*bar*`, `<p>foo<em>bar</em></p>`);
  assertParse(t, `5*6*78`, `<p>5<em>6</em>78</p>`);

  // Rule 2
  assertParse(t, `_foo bar_`, `<p><em>foo bar</em></p>`);
  assertParse(t, `_ foo bar_`, `<p>_ foo bar_</p>`);
  // assertParse(t, `a_"foo"_`, `<p>a_&quot;foo&quot;_</p>`); // TODO: HTML escapes
  assertParse(t, `foo_bar_`, `<p>foo_bar_</p>`);
  assertParse(t, `5_6_78`, `<p>5_6_78</p>`);
  assertParse(t, `пристаням_стремятся_`, `<p>пристаням_стремятся_</p>`);
  // assertParse(t, `aa_"bb"_cc`, `<p>aa_&quot;bb&quot;_cc</p>`); // TODO: HTML escapes
  assertParse(t, `foo-_(bar)_`, `<p>foo-<em>(bar)</em></p>`);

  // Rule 3
  assertParse(t, `_foo*`, `<p>_foo*</p>`);
  assertParse(t, `*foo bar *`, `<p>*foo bar *</p>`);
  assertParse(t, `*foo bar
*`, `<p>*foo bar
*</p>`);
  assertParse(t, `*(*foo)`, `<p>*(*foo)</p>`);
  assertParse(t, `*(*foo*)*`, `<p><em>(<em>foo</em>)</em></p>`);
  assertParse(t, `*foo*bar`, `<p><em>foo</em>bar</p>`);

  // Rule 4
  assertParse(t, `_foo bar _`, `<p>_foo bar _</p>`);
  assertParse(t, `_(_foo)`, `<p>_(_foo)</p>`);
  assertParse(t, `_(_foo_)_`, `<p><em>(<em>foo</em>)</em></p>`);
  assertParse(t, `_foo_bar`, `<p>_foo_bar</p>`);
  assertParse(t, `_пристаням_стремятся`, `<p>_пристаням_стремятся</p>`);
  assertParse(t, `_foo_bar_baz_`, `<p><em>foo_bar_baz</em></p>`);
  assertParse(t, `_(bar)_.`, `<p><em>(bar)</em>.</p>`);

  // Rule 5
  assertParse(t, `**foo bar**`, `<p><strong>foo bar</strong></p>`);
  assertParse(t, `** foo bar**`, `<p>** foo bar**</p>`);
  // assertParse(t, `a**"foo"**`, `<p>a**&quot;foo&quot;**</p>`); // TODO: HTML escapes
  assertParse(t, `foo**bar**`, `<p>foo<strong>bar</strong></p>`);

  // Rule 6
  assertParse(t, `__foo bar__`, `<p><strong>foo bar</strong></p>`);
  assertParse(t, `__ foo bar__`, `<p>__ foo bar__</p>`);
  assertParse(t, `__
foo bar__`, `<p>__
foo bar__</p>`);
  // assertParse(t, `a__"foo"__`, `<p>a__&quot;foo&quot;__</p>`); // TODO: HTML escapes
  assertParse(t, `foo__bar__`, `<p>foo__bar__</p>`);
  assertParse(t, `5__6__78`, `<p>5__6__78</p>`);
  assertParse(t, `пристаням__стремятся__`, `<p>пристаням__стремятся__</p>`);
  assertParse(t, `__foo, __bar__, baz__`, `<p><strong>foo, <strong>bar</strong>, baz</strong></p>`);
  assertParse(t, `foo-__(bar)__`, `<p>foo-<strong>(bar)</strong></p>`);

  // Rule 7
  assertParse(t, `**foo bar **`, `<p>**foo bar **</p>`);
  assertParse(t, `**(**foo)`, `<p>**(**foo)</p>`);
  assertParse(t, `*(**foo**)*`, `<p><em>(<strong>foo</strong>)</em></p>`);
  assertParse(t, `**Gomphocarpus (*Gomphocarpus physocarpus*, syn.
*Asclepias physocarpa*)**`, `<p><strong>Gomphocarpus (<em>Gomphocarpus physocarpus</em>, syn.
<em>Asclepias physocarpa</em>)</strong></p>`);
  // assertParse(t, `**foo "*bar*" foo**`, `<p><strong>foo &quot;<em>bar</em>&quot; foo</strong></p>`); // TODO: HTML escapes
  assertParse(t, `**foo**bar`, `<p><strong>foo</strong>bar</p>`);

  // Rule 8
  assertParse(t, `__foo bar __`, `<p>__foo bar __</p>`);
  assertParse(t, `__(__foo)`, `<p>__(__foo)</p>`);
  assertParse(t, `_(__foo__)_`, `<p><em>(<strong>foo</strong>)</em></p>`);
  assertParse(t, `__foo__bar`, `<p>__foo__bar</p>`);
  assertParse(t, `__пристаням__стремятся`, `<p>__пристаням__стремятся</p>`);
  assertParse(t, `__foo__bar__baz__`, `<p><strong>foo__bar__baz</strong></p>`);
  assertParse(t, `__(bar)__.`, `<p><strong>(bar)</strong>.</p>`);

  // Rule 9
  // assertParse(t, `*foo [bar](/url)*`, `<p><em>foo <a href="/url">bar</a></em></p>`); // TODO: links
  assertParse(t, `*foo
bar*`, `<p><em>foo
bar</em></p>`);
  assertParse(t, `_foo __bar__ baz_`, `<p><em>foo <strong>bar</strong> baz</em></p>`);
  assertParse(t, `_foo _bar_ baz_`, `<p><em>foo <em>bar</em> baz</em></p>`);
  assertParse(t, `__foo_ bar_`, `<p><em><em>foo</em> bar</em></p>`);
  assertParse(t, `*foo *bar**`, `<p><em>foo <em>bar</em></em></p>`);
  assertParse(t, `*foo **bar** baz*`, `<p><em>foo <strong>bar</strong> baz</em></p>`);
  assertParse(t, `*foo**bar**baz*`, `<p><em>foo<strong>bar</strong>baz</em></p>`);
  assertParse(t, `*foo**bar*`, `<p><em>foo**bar</em></p>`);
  assertParse(t, `***foo** bar*`, `<p><em><strong>foo</strong> bar</em></p>`);
  assertParse(t, `*foo **bar***`, `<p><em>foo <strong>bar</strong></em></p>`);
  assertParse(t, `*foo**bar***`, `<p><em>foo<strong>bar</strong></em></p>`);
  assertParse(t, `foo***bar***baz`, `<p>foo<em><strong>bar</strong></em>baz</p>`);
  assertParse(t, `foo******bar*********baz`, `<p>foo<strong><strong><strong>bar</strong></strong></strong>***baz</p>`);
  assertParse(t, `*foo **bar *baz* bim** bop*`, `<p><em>foo <strong>bar <em>baz</em> bim</strong> bop</em></p>`);
  // assertParse(t, `*foo [*bar*](/url)*`, `<p><em>foo <a href="/url"><em>bar</em></a></em></p>`); // TODO: links
  assertParse(t, `** is not an empty emphasis`, `<p>** is not an empty emphasis</p>`);
  assertParse(t, `**** is not an empty strong emphasis`, `<p>**** is not an empty strong emphasis</p>`);

  // Rule 10
  // assertParse(t, `**foo [bar](/url)**`, `<p><strong>foo <a href="/url">bar</a></strong></p>`); // TODO: links
  assertParse(t, `**foo
bar**`, `<p><strong>foo
bar</strong></p>`);
  assertParse(t, `__foo _bar_ baz__`, `<p><strong>foo <em>bar</em> baz</strong></p>`);
  assertParse(t, `__foo __bar__ baz__`, `<p><strong>foo <strong>bar</strong> baz</strong></p>`);
  assertParse(t, `____foo__ bar__`, `<p><strong><strong>foo</strong> bar</strong></p>`);
  assertParse(t, `**foo **bar****`, `<p><strong>foo <strong>bar</strong></strong></p>`);
  assertParse(t, `**foo *bar* baz**`, `<p><strong>foo <em>bar</em> baz</strong></p>`);
  assertParse(t, `**foo*bar*baz**`, `<p><strong>foo<em>bar</em>baz</strong></p>`);
  assertParse(t, `***foo* bar**`, `<p><strong><em>foo</em> bar</strong></p>`);
  assertParse(t, `**foo *bar***`, `<p><strong>foo <em>bar</em></strong></p>`);
  assertParse(t, `**foo *bar **baz**
bim* bop**`, `<p><strong>foo <em>bar <strong>baz</strong>
bim</em> bop</strong></p>`);
  // assertParse(t, `**foo [*bar*](/url)**`, `<p><strong>foo <a href="/url"><em>bar</em></a></strong></p>`); // TODO: links
  assertParse(t, `__ is not an empty emphasis`, `<p>__ is not an empty emphasis</p>`);
  assertParse(t, `____ is not an empty strong emphasis`, `<p>____ is not an empty strong emphasis</p>`);

  // Rule 11
  assertParse(t, `foo ***`, `<p>foo ***</p>`);
  assertParse(t, `foo *\\**`, `<p>foo <em>*</em></p>`);
  assertParse(t, `foo *_*`, `<p>foo <em>_</em></p>`);
  assertParse(t, `foo *****`, `<p>foo *****</p>`);
  assertParse(t, `foo **\\***`, `<p>foo <strong>*</strong></p>`);
  assertParse(t, `foo **_**`, `<p>foo <strong>_</strong></p>`);
  assertParse(t, `**foo*`, `<p>*<em>foo</em></p>`);
  assertParse(t, `*foo**`, `<p><em>foo</em>*</p>`);
  assertParse(t, `***foo**`, `<p>*<strong>foo</strong></p>`);
  assertParse(t, `****foo*`, `<p>***<em>foo</em></p>`);
  assertParse(t, `**foo***`, `<p><strong>foo</strong>*</p>`);
  assertParse(t, `*foo****`, `<p><em>foo</em>***</p>`);

  // Rule 12
  assertParse(t, `foo ___`, `<p>foo ___</p>`);
  assertParse(t, `foo _\\__`, `<p>foo <em>_</em></p>`);
  assertParse(t, `foo _*_`, `<p>foo <em>*</em></p>`);
  assertParse(t, `foo _____`, `<p>foo _____</p>`);
  assertParse(t, `foo __\\___`, `<p>foo <strong>_</strong></p>`);
  assertParse(t, `foo __*__`, `<p>foo <strong>*</strong></p>`);
  assertParse(t, `__foo_`, `<p>_<em>foo</em></p>`);
  assertParse(t, `_foo__`, `<p><em>foo</em>_</p>`);
  assertParse(t, `___foo__`, `<p>_<strong>foo</strong></p>`);
  assertParse(t, `____foo_`, `<p>___<em>foo</em></p>`);
  assertParse(t, `__foo___`, `<p><strong>foo</strong>_</p>`);
  assertParse(t, `_foo____`, `<p><em>foo</em>___</p>`);

  // Rule 13
  assertParse(t, `**foo**`, `<p><strong>foo</strong></p>`);
  assertParse(t, `*_foo_*`, `<p><em><em>foo</em></em></p>`);
  assertParse(t, `__foo__`, `<p><strong>foo</strong></p>`);
  assertParse(t, `_*foo*_`, `<p><em><em>foo</em></em></p>`);
  assertParse(t, `****foo****`, `<p><strong><strong>foo</strong></strong></p>`);
  assertParse(t, `____foo____`, `<p><strong><strong>foo</strong></strong></p>`);
  assertParse(t, `******foo******`, `<p><strong><strong><strong>foo</strong></strong></strong></p>`);

  // Rule 14
  assertParse(t, `***foo***`, `<p><em><strong>foo</strong></em></p>`);
  assertParse(t, `_____foo_____`, `<p><em><strong><strong>foo</strong></strong></em></p>`);

  // Rule 15
  assertParse(t, `*foo _bar* baz_`, `<p><em>foo _bar</em> baz_</p>`);
  assertParse(t, `*foo __bar *baz bim__ bam*`, `<p><em>foo <strong>bar *baz bim</strong> bam</em></p>`);

  // Rule 16
  assertParse(t, `**foo **bar baz**`, `<p>**foo <strong>bar baz</strong></p>`);
  assertParse(t, `*foo *bar baz*`, `<p>*foo <em>bar baz</em></p>`);

  // // Rule 17
  // assertParse(t, `*[bar*](/url)`, `<p>*<a href="/url">bar*</a></p>`);
  // assertParse(t, `_foo [bar_](/url)`, `<p>_foo <a href="/url">bar_</a></p>`);
  // assertParse(t, `*<img src="foo" title="*"/>`, `<p>*<img src="foo" title="*"/></p>`);
  // assertParse(t, `**<a href="**">`, `<p>**<a href="**"></p>`);
  // assertParse(t, `__<a href="__">`, `<p>__<a href="__"></p>`);
  // assertParse(t, `*a \`*\`*`, `<p><em>a <code>*</code></em></p>`);
  // assertParse(t, `_a \`_\`_`, `<p><em>a <code>_</code></em></p>`);
  // assertParse(t, `**a<https://foo.bar/?q=**>`, `<p>**a<a href="https://foo.bar/?q=**">https://foo.bar/?q=**</a></p>`);
  // assertParse(t, `__a<https://foo.bar/?q=__>`, `<p>__a<a href="https://foo.bar/?q=__">https://foo.bar/?q=__</a></p>`);
});

run();
