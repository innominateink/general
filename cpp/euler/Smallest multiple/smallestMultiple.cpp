#include <iostream>
#include <algorithm>

long findLCM(long a, long b);

int main() {
    long lcm = 1;
    for(long i = 2;i<=20;i++){
        lcm=findLCM(lcm,i);
    }
    std::cout << lcm;
	return 0;
}

long findLCM(long a, long b){
    long lcm, gcd;
    long i = 1;
    long ceil = std::min(a,b);

    while(i<=ceil){
        if ((a%i==0)&&(b%i==0)){
            gcd = i;
        }
        i++;
    }
    lcm = (a*b)/gcd;
    return lcm;
}
