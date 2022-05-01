import { useEffect } from 'react';

export interface ICustomDesignParams {
  primary_color?: string;
  secondary_color?: string;
  background_color?: string;
  background_image?: string;
  header_bg_color?: string;
  footer_bg_color?: string;
  left_side_bg_color?: string;
  right_side_bg_color?: string;
  custom_css_url?: string;
}

const useDesignCustomization = () => {
  useEffect(() => {
    if (typeof (window as any).DESIGN_CUSTOMIZATION === 'undefined') {
      // we'll check from url if set by custom_design param
      const urlParams = new URLSearchParams(window.location.search);
      // value must be url encoded otherwise may not work.
      if (urlParams.get('custom_design')) {
        (window as any).DESIGN_CUSTOMIZATION = urlParams.get('custom_design');
      } else {
        return;
      }
    }

    let designCustomParams: ICustomDesignParams = {};
    try {
      designCustomParams = JSON.parse((window as any).DESIGN_CUSTOMIZATION);
    } catch (e) {
      console.log("can't parse custom design params");
      return;
    }

    let css = '';

    if (designCustomParams.primary_color) {
      css += '.primaryColor{ color: ' + designCustomParams.primary_color + '}';
      css +=
        '.text-primaryColor { color: ' + designCustomParams.primary_color + '}';
      css +=
        '.placeholder\\:text-primaryColor\\/70::placeholder { color: ' +
        designCustomParams.primary_color +
        '}';
      css +=
        '.bg-primaryColor { background: ' +
        designCustomParams.primary_color +
        ' !important;}';
      css +=
        '.hover\\:bg-primaryColor:hover { background: ' +
        designCustomParams.primary_color +
        ' !important;}';
      css +=
        '.border-primaryColor { border-color: ' +
        designCustomParams.primary_color +
        ' !important;}';
    }

    if (designCustomParams.secondary_color) {
      css +=
        '.secondaryColor { color: ' +
        designCustomParams.secondary_color +
        ' !important;}';
      css +=
        '.text-secondaryColor { color: ' +
        designCustomParams.secondary_color +
        ' !important;}';
      css +=
        '.hover\\:text-secondaryColor:hover { color: ' +
        designCustomParams.secondary_color +
        ' !important;}';
      css +=
        '.group:hover .group-hover\\:text-secondaryColor { color: ' +
        designCustomParams.secondary_color +
        ' !important;}';
      css +=
        '.bg-secondaryColor, .hover:bg-secondaryColor:hover { background: ' +
        designCustomParams.secondary_color +
        ' !important;}';
      css +=
        '.hover:bg-secondaryColor:hover { background: ' +
        designCustomParams.secondary_color +
        ' !important;}';
      css +=
        '.border-secondaryColor { border-color: ' +
        designCustomParams.secondary_color +
        ' !important;}';
    }

    if (designCustomParams.background_image) {
      css += `.main-app-bg { 
        background: url("${designCustomParams.background_image}") !important;
        background-position: center !important;
        background-repeat: no-repeat !important;
        background-size: cover !important;
        }`;
      css += `.error-app-bg { 
        background: url("${designCustomParams.background_image}") !important;
        background-position: center !important;
        background-repeat: no-repeat !important;
        background-size: cover !important;
        }`;
    } else if (designCustomParams.background_color) {
      css += `.main-app-bg { 
        background: ${designCustomParams.background_color} !important;
        }`;
      css += `.error-app-bg { 
        background: ${designCustomParams.background_color} !important;
        }`;
    }

    if (designCustomParams.header_bg_color) {
      css +=
        'header#main-header { background: ' +
        designCustomParams.header_bg_color +
        '; }';
    }

    if (designCustomParams.footer_bg_color) {
      css +=
        'footer#main-footer { background: ' +
        designCustomParams.footer_bg_color +
        '; }';
    }

    if (designCustomParams.left_side_bg_color) {
      css +=
        '.participants-wrapper { background: ' +
        designCustomParams.left_side_bg_color +
        '; }';
      css +=
        '.vertical-webcams { background: ' +
        designCustomParams.left_side_bg_color +
        ' !important; }';
    }

    if (designCustomParams.right_side_bg_color) {
      css +=
        '.messageModule-wrapper { background: ' +
        designCustomParams.right_side_bg_color +
        '; }';
    }

    const head = document.head;
    let link: HTMLLinkElement, style: HTMLStyleElement;

    if (designCustomParams.custom_css_url) {
      link = document.createElement('link');

      link.type = 'text/css';
      link.rel = 'stylesheet';
      link.href = designCustomParams.custom_css_url;

      head.appendChild(link);
    }

    if (css !== '') {
      style = document.createElement('style');
      style.id = 'plugNmeetCustomization';
      style.textContent = css;
      head.appendChild(style);
    }

    return () => {
      if (css !== '') {
        head.removeChild(style);
      }
      if (designCustomParams.custom_css_url) {
        head.removeChild(link);
      }
    };
  }, []);
};

export default useDesignCustomization;
