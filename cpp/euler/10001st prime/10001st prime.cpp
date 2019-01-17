#include <iostream>

bool isPrime(int);

int main(){
    int i = 1, n = 2;
    while (i<=10001){
        printf("Prime no%d: %d \n",i,n);
        if (isPrime(n)){
         i++;
        }
        n++;
    }
}

bool isPrime(int cp){
    /*
    function is_prime(n)
    if n ≤ 1
        return false
    else if n ≤ 3
        return true
    else if n mod 2 = 0 or n mod 3 = 0
        return false
    let i ← 5
    while i * i ≤ n
        if n mod i = 0 or n mod (i + 2) = 0
            return false
        i ← i + 6
    return true
    */

    if (cp <= 3) {return true;}
    else if (cp%2==0 || cp%3==0) {return false;}
    int i = 5;
    while (i*i<=cp){
            if (cp%i==0 || cp%(i+2)==0) {return false;}
            i += 6;
    }
    return true;
}
