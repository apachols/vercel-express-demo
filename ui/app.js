var app = new Vue({
  el: "#app",
  data: {
    url: "",
    slug: "",
    created: null,
    newUrl: null,
  },
  methods: {
    async createUrl() {
      console.log(this.url, this.slug);
      const response = await fetch("/url", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          url: this.url,
          slug: this.slug,
        }),
      });
      this.created = await response.json();
      if (this.created.slug) {
        // TODO: this.created = `https://ep-url.site/` + this.created.slug;
        this.created = window.location.href + this.created.slug;
        this.newUrl = true;
      } else this.created = this.created.message;
    },
  },
});
