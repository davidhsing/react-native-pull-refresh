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
| props             | type      | description                                                                    | Default               |
|-------------------|-----------|--------------------------------------------------------------------------------|-----------------------|
| pulldownEnabled   | Boolean   | Whether pulldown refresh is enabled                                            | `true`                |
| pullupEnabled     | Boolean   | Whether pullup refresh is enabled                                              | `true`                |
| pulldownHeight    | Number    | The height of the pulldown loading component, used to determine pulldown state | `120`                 |
| pullupHeight      | Number    | The height of the pullup loading component, used to determine pullup state     | `120`                 |
| pulldownLoading   | Component | Custom pulldown loading component                                              | `<PulldownLoading />` |
| pullupLoading     | Component | Custom pullup loading component                                                | `<PullupLoading />`   |
| containerFactor   | Number    | The container factor is used to adjust the height of the refresh judgment      | `0.5`                 |
| pullingFactor     | Number    | Determine the coefficient of pulling state length                              | `2.2`                 |
| onPulldownRefresh | Function  | Callback of pulldown refresh, load data with it                                | `()=>void`            |
| onPullupRefresh   | Function  | Callback of pullup refresh, load data with it                                  | `()=>void`            |


## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
