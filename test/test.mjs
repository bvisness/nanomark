import { parse } from "../index.mjs";
import { test, run, assertEqual } from "./framework/index.mjs";

test("parse", t => {
  /*
   * Tests from the CommonMark spec:
   * https://spec.commonmark.org/0.31.2/#emphasis-and-strong-emphasis
   */

  // Rule 1
  assertEqual(t, parse(`*foo bar*`), `<p><em>foo bar</em></p>`);
  assertEqual(t, parse(`a * foo bar*`), `<p>a * foo bar*</p>`);
  assertEqual(t, parse(`a*"foo"*`), `<p>a*&quot;foo&quot;*</p>`);
  assertEqual(t, parse(`* a *`), `<p>* a *</p>`);
  assertEqual(t, parse(`*$*alpha.`), `<p>*$*alpha.</p>`);
  assertEqual(t, parse(`*£*bravo.`), `<p>*£*bravo.</p>`);
  assertEqual(t, parse(`*€*charlie.`), `<p>*€*charlie.</p>`);
  assertEqual(t, parse(`foo*bar*`), `<p>foo<em>bar</em></p>`);
  assertEqual(t, parse(`5*6*78`), `<p>5<em>6</em>78</p>`);

  return;

  // Rule 2
  assertEqual(t, parse(`_foo bar_`), `<p><em>foo bar</em></p>`);
  assertEqual(t, parse(`_ foo bar_`), `<p>_ foo bar_</p>`);
  assertEqual(t, parse(`a_"foo"_`), `<p>a_&quot;foo&quot;_</p>`);
  assertEqual(t, parse(`foo_bar_`), `<p>foo_bar_</p>`);
  assertEqual(t, parse(`5_6_78`), `<p>5_6_78</p>`);
  assertEqual(t, parse(`пристаням_стремятся_`), `<p>пристаням_стремятся_</p>`);
  assertEqual(t, parse(`aa_"bb"_cc`), `<p>aa_&quot;bb&quot;_cc</p>`);
  assertEqual(t, parse(`foo-_(bar)_`), `<p>foo-<em>(bar)</em></p>`);

  // Rule 3
  assertEqual(t, parse(`_foo*`), `<p>_foo*</p>`);
  assertEqual(t, parse(`*foo bar *`), `<p>*foo bar *</p>`);
  assertEqual(t, parse(`*foo bar
*`), `<p>*foo bar
*</p>`);
  assertEqual(t, parse(`*(*foo)`), `<p>*(*foo)</p>`);
  assertEqual(t, parse(`*(*foo*)*`), `<p><em>(<em>foo</em>)</em></p>`);
  assertEqual(t, parse(`*foo*bar`), `<p><em>foo</em>bar</p>`);

  // Rule 4
  assertEqual(t, parse(`_foo bar _`), `<p>_foo bar _</p>`);
  assertEqual(t, parse(`_(_foo)`), `<p>_(_foo)</p>`);
  assertEqual(t, parse(`_(_foo_)_`), `<p><em>(<em>foo</em>)</em></p>`);
  assertEqual(t, parse(`_foo_bar`), `<p>_foo_bar</p>`);
  assertEqual(t, parse(`_пристаням_стремятся`), `<p>_пристаням_стремятся</p>`);
  assertEqual(t, parse(`_foo_bar_baz_`), `<p><em>foo_bar_baz</em></p>`);
  assertEqual(t, parse(`_(bar)_.`), `<p><em>(bar)</em>.</p>`);

  // Rule 5
  assertEqual(t, parse(`**foo bar**`), `<p><strong>foo bar</strong></p>`);
  assertEqual(t, parse(`** foo bar**`), `<p>** foo bar**</p>`);
  assertEqual(t, parse(`a**"foo"**`), `<p>a**&quot;foo&quot;**</p>`);
  assertEqual(t, parse(`foo**bar**`), `<p>foo<strong>bar</strong></p>`);

  // Rule 6
  assertEqual(t, parse(`__foo bar__`), `<p><strong>foo bar</strong></p>`);
  assertEqual(t, parse(`__ foo bar__`), `<p>__ foo bar__</p>`);
  assertEqual(t, parse(`__
foo bar__`), `<p>__
foo bar__</p>`);
  assertEqual(t, parse(`a__"foo"__`), `<p>a__&quot;foo&quot;__</p>`);
  assertEqual(t, parse(`foo__bar__`), `<p>foo__bar__</p>`);
  assertEqual(t, parse(`5__6__78`), `<p>5__6__78</p>`);
  assertEqual(t, parse(`пристаням__стремятся__`), `<p>пристаням__стремятся__</p>`);
  assertEqual(t, parse(`__foo, __bar__, baz__`), `<p><strong>foo, <strong>bar</strong>, baz</strong></p>`);
  assertEqual(t, parse(`foo-__(bar)__`), `<p>foo-<strong>(bar)</strong></p>`);

  // Rule 7
  assertEqual(t, parse(`**foo bar **`), `<p>**foo bar **</p>`);
  assertEqual(t, parse(`**(**foo)`), `<p>**(**foo)</p>`);
  assertEqual(t, parse(`*(**foo**)*`), `<p><em>(<strong>foo</strong>)</em></p>`);
  assertEqual(t, parse(`**Gomphocarpus (*Gomphocarpus physocarpus*, syn.
*Asclepias physocarpa*)**`), `<p><strong>Gomphocarpus (<em>Gomphocarpus physocarpus</em>, syn.
<em>Asclepias physocarpa</em>)</strong></p>`);
  assertEqual(t, parse(`**foo "*bar*" foo**`), `<p><strong>foo &quot;<em>bar</em>&quot; foo</strong></p>`);
  assertEqual(t, parse(`**foo**bar`), `<p><strong>foo</strong>bar</p>`);

  // Rule 8
  assertEqual(t, parse(`__foo bar __`), `<p>__foo bar __</p>`);
  assertEqual(t, parse(`__(__foo)`), `<p>__(__foo)</p>`);
  assertEqual(t, parse(`_(__foo__)_`), `<p><em>(<strong>foo</strong>)</em></p>`);
  assertEqual(t, parse(`__foo__bar`), `<p>__foo__bar</p>`);
  assertEqual(t, parse(`__пристаням__стремятся`), `<p>__пристаням__стремятся</p>`);
  assertEqual(t, parse(`__foo__bar__baz__`), `<p><strong>foo__bar__baz</strong></p>`);
  assertEqual(t, parse(`__(bar)__.`), `<p><strong>(bar)</strong>.</p>`);

  // Rule 9
  assertEqual(t, parse(`*foo [bar](/url)*`), `<p><em>foo <a href="/url">bar</a></em></p>`);
  assertEqual(t, parse(`*foo
bar*`), `<p><em>foo
bar</em></p>`);
  assertEqual(t, parse(`_foo __bar__ baz_`), `<p><em>foo <strong>bar</strong> baz</em></p>`);
  assertEqual(t, parse(`_foo _bar_ baz_`), `<p><em>foo <em>bar</em> baz</em></p>`);
  assertEqual(t, parse(`__foo_ bar_`), `<p><em><em>foo</em> bar</em></p>`);
  assertEqual(t, parse(`*foo *bar**`), `<p><em>foo <em>bar</em></em></p>`);
  assertEqual(t, parse(`*foo **bar** baz*`), `<p><em>foo <strong>bar</strong> baz</em></p>`);
  assertEqual(t, parse(`*foo**bar**baz*`), `<p><em>foo<strong>bar</strong>baz</em></p>`);
  assertEqual(t, parse(`*foo**bar*`), `<p><em>foo**bar</em></p>`);
  assertEqual(t, parse(`***foo** bar*`), `<p><em><strong>foo</strong> bar</em></p>`);
  assertEqual(t, parse(`*foo **bar***`), `<p><em>foo <strong>bar</strong></em></p>`);
  assertEqual(t, parse(`*foo**bar***`), `<p><em>foo<strong>bar</strong></em></p>`);
  assertEqual(t, parse(`foo***bar***baz`), `<p>foo<em><strong>bar</strong></em>baz</p>`);
  assertEqual(t, parse(`foo******bar*********baz`), `<p>foo<strong><strong><strong>bar</strong></strong></strong>***baz</p>`);
  assertEqual(t, parse(`*foo **bar *baz* bim** bop*`), `<p><em>foo <strong>bar <em>baz</em> bim</strong> bop</em></p>`);
  assertEqual(t, parse(`*foo [*bar*](/url)*`), `<p><em>foo <a href="/url"><em>bar</em></a></em></p>`);
  assertEqual(t, parse(`** is not an empty emphasis`), `<p>** is not an empty emphasis</p>`);
  assertEqual(t, parse(`**** is not an empty strong emphasis`), `<p>**** is not an empty strong emphasis</p>`);

  // Rule 10
  assertEqual(t, parse(`**foo [bar](/url)**`), `<p><strong>foo <a href="/url">bar</a></strong></p>`);
  assertEqual(t, parse(`**foo
bar**`), `<p><strong>foo
bar</strong></p>`);
  assertEqual(t, parse(`__foo _bar_ baz__`), `<p><strong>foo <em>bar</em> baz</strong></p>`);
  assertEqual(t, parse(`__foo __bar__ baz__`), `<p><strong>foo <strong>bar</strong> baz</strong></p>`);
  assertEqual(t, parse(`____foo__ bar__`), `<p><strong><strong>foo</strong> bar</strong></p>`);
  assertEqual(t, parse(`**foo **bar****`), `<p><strong>foo <strong>bar</strong></strong></p>`);
  assertEqual(t, parse(`**foo *bar* baz**`), `<p><strong>foo <em>bar</em> baz</strong></p>`);
  assertEqual(t, parse(`**foo*bar*baz**`), `<p><strong>foo<em>bar</em>baz</strong></p>`);
  assertEqual(t, parse(`***foo* bar**`), `<p><strong><em>foo</em> bar</strong></p>`);
  assertEqual(t, parse(`**foo *bar***`), `<p><strong>foo <em>bar</em></strong></p>`);
  assertEqual(t, parse(`**foo *bar **baz**
bim* bop**`), `<p><strong>foo <em>bar <strong>baz</strong>
bim</em> bop</strong></p>`);
  assertEqual(t, parse(`**foo [*bar*](/url)**`), `<p><strong>foo <a href="/url"><em>bar</em></a></strong></p>`);
  assertEqual(t, parse(`__ is not an empty emphasis`), `<p>__ is not an empty emphasis</p>`);
  assertEqual(t, parse(`____ is not an empty strong emphasis`), `<p>____ is not an empty strong emphasis</p>`);

  // Rule 11
  assertEqual(t, parse(`foo ***`), `<p>foo ***</p>`);
  assertEqual(t, parse(`foo *\\**`), `<p>foo <em>*</em></p>`);
  assertEqual(t, parse(`foo *_*`), `<p>foo <em>_</em></p>`);
  assertEqual(t, parse(`foo *****`), `<p>foo *****</p>`);
  assertEqual(t, parse(`foo **\\***`), `<p>foo <strong>*</strong></p>`);
  assertEqual(t, parse(`foo **_**`), `<p>foo <strong>_</strong></p>`);
  assertEqual(t, parse(`**foo*`), `<p>*<em>foo</em></p>`);
  assertEqual(t, parse(`*foo**`), `<p><em>foo</em>*</p>`);
  assertEqual(t, parse(`***foo**`), `<p>*<strong>foo</strong></p>`);
  assertEqual(t, parse(`****foo*`), `<p>***<em>foo</em></p>`);
  assertEqual(t, parse(`**foo***`), `<p><strong>foo</strong>*</p>`);
  assertEqual(t, parse(`*foo****`), `<p><em>foo</em>***</p>`);

  // Rule 12
  assertEqual(t, parse(`foo ___`), `<p>foo ___</p>`);
  assertEqual(t, parse(`foo _\\__`), `<p>foo <em>_</em></p>`);
  assertEqual(t, parse(`foo _*_`), `<p>foo <em>*</em></p>`);
  assertEqual(t, parse(`foo _____`), `<p>foo _____</p>`);
  assertEqual(t, parse(`foo __\\___`), `<p>foo <strong>_</strong></p>`);
  assertEqual(t, parse(`foo __*__`), `<p>foo <strong>*</strong></p>`);
  assertEqual(t, parse(`__foo_`), `<p>_<em>foo</em></p>`);
  assertEqual(t, parse(`_foo__`), `<p><em>foo</em>_</p>`);
  assertEqual(t, parse(`___foo__`), `<p>_<strong>foo</strong></p>`);
  assertEqual(t, parse(`____foo_`), `<p>___<em>foo</em></p>`);
  assertEqual(t, parse(`__foo___`), `<p><strong>foo</strong>_</p>`);
  assertEqual(t, parse(`_foo____`), `<p><em>foo</em>___</p>`);

  // Rule 13
  assertEqual(t, parse(`**foo**`), `<p><strong>foo</strong></p>`);
  assertEqual(t, parse(`*_foo_*`), `<p><em><em>foo</em></em></p>`);
  assertEqual(t, parse(`__foo__`), `<p><strong>foo</strong></p>`);
  assertEqual(t, parse(`_*foo*_`), `<p><em><em>foo</em></em></p>`);
  assertEqual(t, parse(`****foo****`), `<p><strong><strong>foo</strong></strong></p>`);
  assertEqual(t, parse(`____foo____`), `<p><strong><strong>foo</strong></strong></p>`);
  assertEqual(t, parse(`******foo******`), `<p><strong><strong><strong>foo</strong></strong></strong></p>`);

  // Rule 14
  assertEqual(t, parse(`***foo***`), `<p><em><strong>foo</strong></em></p>`);
  assertEqual(t, parse(`_____foo_____`), `<p><em><strong><strong>foo</strong></strong></em></p>`);

  // Rule 15
  assertEqual(t, parse(`*foo _bar* baz_`), `<p><em>foo _bar</em> baz_</p>`);
  assertEqual(t, parse(`*foo __bar *baz bim__ bam*`), `<p><em>foo <strong>bar *baz bim</strong> bam</em></p>`);

  // Rule 16
  assertEqual(t, parse(`**foo **bar baz**`), `<p>**foo <strong>bar baz</strong></p>`);
  assertEqual(t, parse(`*foo *bar baz*`), `<p>*foo <em>bar baz</em></p>`);

  // Rule 17
  assertEqual(t, parse(`*[bar*](/url)`), `<p>*<a href="/url">bar*</a></p>`);
  assertEqual(t, parse(`_foo [bar_](/url)`), `<p>_foo <a href="/url">bar_</a></p>`);
  assertEqual(t, parse(`*<img src="foo" title="*"/>`), `<p>*<img src="foo" title="*"/></p>`);
  assertEqual(t, parse(`**<a href="**">`), `<p>**<a href="**"></p>`);
  assertEqual(t, parse(`__<a href="__">`), `<p>__<a href="__"></p>`);
  assertEqual(t, parse(`*a \`*\`*`), `<p><em>a <code>*</code></em></p>`);
  assertEqual(t, parse(`_a \`_\`_`), `<p><em>a <code>_</code></em></p>`);
  assertEqual(t, parse(`**a<https://foo.bar/?q=**>`), `<p>**a<a href="https://foo.bar/?q=**">https://foo.bar/?q=**</a></p>`);
  assertEqual(t, parse(`__a<https://foo.bar/?q=__>`), `<p>__a<a href="https://foo.bar/?q=__">https://foo.bar/?q=__</a></p>`);
});

run();
