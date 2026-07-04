# @unikue/react-native-pull-refresh


react-native pull refresh on iOS, Android and Web

## ⚡Milestones
  - Bump package versions to latest
  - Fix `PullRefresh` `onScroll` event

## 💪🏻 Support
| Platform |   | solved                                        |
|----------|---|-----------------------------------------------|
| iOS      | ✅ | 🔥 Perfect                                    |
| Android  | ✅ | 😂 Bottom response is bad                     |
| Web      | ✅ | 😭 Pulling and scrolling cant switch smoothly |

| Library                      |     |
|------------------------------|-----|
| react-native-gesture-handler | 2.x |
| react-native-reanimated      | 4.x |

#### ⚠️ Warning
`react-native-pull-refresh` Only support wrapper `Animated.ScrollView` and `Animated.FlatList`

not support nested PullRefresh!

## Installation

It relies on `react-native-gesture-handler` and `react-native-reanimated`

so please install them before you use this package

```sh
yarn install react-native-gesture-hanlder react-native-reanimated
```

```sh
yarn install @unikue/react-native-pull-refresh
```

## Usage

```js
import { PullRefresh } from '@unikue/react-native-pull-refresh';

// ...

 <PullRefresh
  onPulldownRefresh={downLoader}
  onPullupRefresh={upLoader}
  pulldownHeight={80}
  pullupHeight={100}
  pullupEnabled={true}
>

  <Animated.FlatList
    data={[]}
    renderItem={() => null}
  />

 {/* or*/}

  <Animated.ScrollView>
    {/* children */}
  </Animated.ScrollView>
</PullRefresh>
```

## Example
| <img src="./gifs/ios.gif" alt="ios-example" width="240"> |     <img src="./gifs/android.gif" alt="ios-example" width="250">         |
| :--------: | :-----------: |
| iOS     |   Android        |


## Props
| props             | type      | description                                                  | Default  |
| ----------------- | --------- | ------------------------------------------------------------ | -------- |
| pulldownHeight    | Number    | The height of the drop-down load component is defined, and the judgment of the drop-down state depends on this value | 140      |
| pullupHeight      | Number    | The height of the pull-up component is defined, and the pull-up state is determined by this value | 100      |
| containerFactor   | Number    | The container factor is used to adjust the height of the refresh judgment | 0.5      |
| pullingFactor     | Number    | Determine the coefficient of pulling state length            | 2.2        |
| pullupEnabled      | Boolean   | whether show pullingupLoading                                | false    |
| pulldownLoading   | Component | You can custom the Component                                 |          |
| pullupLoading     | Component | You can custom the Component                                 |          |
|                   |           |                                                              |          |
| onPulldownRefresh | Function  | callback of pulling down refresh, load data with it          | ()=>void |
| onPullupRefresh   | Function  | callback of pulling up refresh, load data with it            | ()=>void |


## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
