import { h, Fragment } from 'vue';
import { JSX } from 'vue/jsx-runtime';

export const other = () => {
  return (
    <div class="page-container">
      <h1>Other</h1>
      <details class="toc" open>
        <summary>
          <h3 class="toc-title">Table of Content</h3>
        </summary>
        <ul class="toc-contents">
          <li>
            <details id="1754" class="toc-section">
              <summary>
                <a href="">Functions</a>
              </summary>
              <ul>
                <a href="other.html#isaddressobject">isAddressObject</a>
              </ul>
            </details>
          </li>
        </ul>
      </details>
      <div class="col-content">
        <div>
          <div>
            <div id="1754">
              <h2 class="tsd-anchor-link">Functions</h2>
              <h3 class="tsd-anchor-link" id="isaddressobject">
                is
                <wbr />
                Address
                <wbr />
                Object
                <a href="#isaddressobject" aria-label="Permalink" class="tsd-anchor-icon">
                  <svg
                    class="icon icon-tabler icon-tabler-link"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor"
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" id="icon-anchor-a"></path>
                    <path d="M10 14a3.5 3.5 0 0 0 5 0l4 -4a3.5 3.5 0 0 0 -5 -5l-.5 .5" id="icon-anchor-b"></path>
                    <path d="M14 10a3.5 3.5 0 0 0 -5 0l-4 4a3.5 3.5 0 0 0 5 5l.5 -.5" id="icon-anchor-c"></path>
                  </svg>
                </a>
              </h3>
              <section class="tsd-panel">
                <ul class="tsd-signatures tsd-is-external">
                  <li class="tsd-signature tsd-anchor-link" id="isAddressObject-1">
                    <span class="tsd-kind-call-signature">
                      is
                      <wbr />
                      Address
                      <wbr />
                      Object
                    </span>
                    <span class="tsd-signature-symbol">(</span>
                    <span class="tsd-kind-parameter">address</span>
                    <span class="tsd-signature-symbol">)</span>
                    <span class="tsd-signature-symbol">: </span>
                    <span class="tsd-signature-type">boolean</span>
                    <a href="#isAddressObject-1" aria-label="Permalink" class="tsd-anchor-icon">
                      <svg
                        class="icon icon-tabler icon-tabler-link"
                        viewBox="0 0 24 24"
                        stroke-width="2"
                        stroke="currentColor"
                        fill="none"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <use href="#icon-anchor-a"></use>
                        <use href="#icon-anchor-b"></use>
                        <use href="#icon-anchor-c"></use>
                      </svg>
                    </a>
                  </li>
                  <li class="tsd-description">
                    <div class="tsd-comment tsd-typography">
                      <p>
                        Check whether the provider object is instance of
                        <code>Address</code>, handling the case of duplicated dependencies.
                      </p>
                    </div>
                    <div class="tsd-parameters">
                      <h4 class="tsd-parameters-title">Parameters</h4>
                      <ul class="tsd-parameter-list">
                        <li>
                          <h5>
                            <span class="tsd-kind-parameter">address</span>:<span class="tsd-signature-type">null</span>
                            <span class="tsd-signature-symbol"> | </span>
                            <span class="tsd-signature-type">object</span>
                          </h5>
                        </li>
                      </ul>
                    </div>
                    <h4 class="tsd-returns-title">
                      Returns <span class="tsd-signature-type">boolean</span>
                    </h4>
                    <aside class="tsd-sources">
                      <ul>
                        <li>Defined in everscale-inpage-provider/src/utils.ts:61</li>
                      </ul>
                    </aside>
                  </li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
