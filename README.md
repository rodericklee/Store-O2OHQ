O2O HQ | 环球商网 Store
=====================


#### Key features. ####

 1. **Gulp** - Use Gulp to minify and build project files and watch for changes while you code.
 2. **AngularJS Structure** - Structure that makes sense and is used by the AngularJS community.
 3. **lodash** - Utilizes Lodash speed, flexibility, and cross browser support for faster functionality. A modern JavaScript utility library delivering modularity, performance & extras. ([https://lodash.com/docs/4.16.4])
 4. **Bower** - Utilize Bower to have your JS libraries under control.
 5. **Twitter Bootstrap 3** - Bootstrap front-end framework and including bootstrap directives ([http://angular-ui.github.io/bootstrap/]) for AngularJS.
 5. **Icons** - FontAwesome and Google Material design icons available.
 6. **linter** - HTML output linter is: `build/eslint-report-results.html`
 7. <del>**Sass** - Allows to use Sass as a project styling preprocessor. Sass is built with gulp-sass nodeJS package.</del> *Feature no longer working.*

#### Prerequisites ####

- node.js [http://nodejs.org/]
- npm [http://www.npmjs.org/]
- bower [http://bower.io/]
- gulp.js [http://gulpjs.com/]

#### Installation and Usage ####

First of all you need to have [Node.js] (http://nodejs.org/).

<details>
  <summary> **Spoiler:** One Linner (requires GIT, NPM, Bower, Node.js) </summary>
  ```
  npm install -g bower && \
  npm install && \
  bower install && \
  mkdir build && \
  gulp &
  ```
</details>

<br>

Clone the repository
```engine='sh'
$ git clone https://{{USERNAME}}@bitbucket.org/o2oworldwide/store.git
```

Install bower globally
```engine='sh'
$ npm install -g bower
```

Install requirements
```engine='sh'
$ npm install
```

Install bower requirements (AngularJS, jQuery etc.)
```engine='sh'
$ bower install
```

Build project and watch for changes.
*The gulp build process doesn't create this folder for you ... **#FixMe***
```engine='sh'
$ mkdir build
```

Build project, deploy watches, load server.
```engine='sh'
$ gulp & # Adding the '&' runs the server in the background

# ## The same as running
# $ gulp build
# $ gulp server &
# $ gulp watch &
```

```engine='sh'
$ gulp build:dist:en
$ gulp build:dist:zh
```
