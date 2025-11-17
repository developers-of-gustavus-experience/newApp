
import {Switch, Text, View, StyleSheet} from 'react-native';
import { useSettings } from './context/SettingsContext';

export default function SettingsScreen() {
  const { FEshown, setFEshown, WTEshown, setWTEshown, LNshown, setLNshown } = useSettings(); 

  return (
    <View style = {styles.container}>

      <View style={styles.settingRow}>
        <Text style={styles.text}>Featured Events</Text>
        <Switch value={FEshown}onValueChange={setFEshown} />
      </View>

      <View style={styles.settingRow}>
        <Text style={styles.text}>Where to Eat</Text>
        <Switch value={WTEshown}onValueChange={setWTEshown} />
      </View>

      <View style={styles.settingRow}>
        <Text style={styles.text}>Latest News</Text>
        <Switch value={LNshown}onValueChange={setLNshown} />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  text: {
    fontSize: 16,
    marginVertical: 10,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 10,
  }
});