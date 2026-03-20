import { Image, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import Animated, {useSharedValue, withSpring} from 'react-native-reanimated'
import { useEffect } from "react";
import { router  } from "expo-router";

export default function Index() {
  const ring1padding = useSharedValue(0);
  const ring2padding = useSharedValue(0);
  useEffect(()=>{
    ring1padding.value = 0;
    ring2padding.value = 0;
    setTimeout(()=> (ring1padding.value = withSpring( ring1padding.value + hp(5))), 100 );
    setTimeout(()=> (ring2padding.value = withSpring( ring2padding.value + hp(5))), 300 );
    setTimeout(()=>router.replace("/(auth)/signup"), 2500)
  },[])
  return (
   <View
   className="flex-1 flex justify-center items-center bg-amber-500">
    <StatusBar barStyle={'light-content'}/>

      {/* logo image with rings */}
      <Animated.View className="bg-white/20 rounded-full flex items-center justify-center " style={{padding: ring2padding}}>
          <Animated.View className="bg-white/20 rounded-full flex items-center justify-center " style={{padding: ring1padding}}>
            <Image
             style={{ width: hp(20), height: hp(20) }}
             source={require('@/assets/images/welcome.png')}/>
          </Animated.View>
      </Animated.View>

      {/* title and punchline */}
      <View className="flex items-center mt-2">
        <Text style={{fontSize: hp(7)}} className="font-bold  text-white tracking-widest">Foody</Text>
        <Text style={{fontSize: hp(2)}} className="font-medium text-white tracking-widest">Food is always right!</Text>
      </View>
   </View>
  );
}