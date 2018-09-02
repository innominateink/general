#include <iostream>
#include <fstream>
#include <stdio.h>
#include <vector>
#include <regex>
using namespace std;

void insertionSort(vector<int>&);
void selectionSort(vector<int>&);

int main ()
{
    vector<int> num;
    int elementNo;
    string inputStr;
    regex integer("(\\+|-)?[[:digit:]]+");
    regex posInteger("(\\+)?[[:digit:]]+");

    do {
        cout << "Number of elements in array?" << endl; //--need to add random option, if input is 0
        cin >> inputStr;
    } while(!regex_match(inputStr,posInteger));
    stringstream(inputStr) >> elementNo;

    for (int i = 0; i<elementNo; i++) //fill array with user input
    {
        do {
            cout << "Enter a number for position " << i+1 << endl;
            cin >> inputStr;
        } while(!regex_match(inputStr,integer));
            int inputInt;
            stringstream(inputStr) >> inputInt;
            num.push_back(inputInt);
    }

    int algo;
    do{
    cout << "Please select sorting algorithm." << endl << "1 - Insertion Sort" << endl << "2 - Selection Sort" << endl;
    cin >> algo;
    } while (algo!=1 && algo!=2);

    cout << "Sorting: [";
    for (int i = 0; i<num.size(); i++){ cout << num[i] << " ";}
    cout << "]" << endl;

    clock_t t = clock();
    switch (algo)
    {
        case 1:
            insertionSort(num);
        break;
        case 2:
            selectionSort(num);
        break;
    }

    t = clock() - t;
    printf("Elapsed clicks: %d (%f seconds).\n", t,((float)t)/CLOCKS_PER_SEC);
    printf("Sorted: [");
    for (int i = 0; i<num.size(); i++){ printf("%d ",num[i]);};
    printf("]\n");


    return 0;
}

//Insertion Sort goes through the whole list, swapping the current number backwards whenever the previous number is greater
void insertionSort(vector<int>& num){
    int j;
    for (short c = 1; c < num.size(); c++)
    {
        j = c;                             //j keeps track of the current position, starts at c and moves backwards (into sorted list)
        while ((j>0) && num[j-1]>num[j]) { //swap number until it finds a sorted position
            swap(num[j-1],num[j]);
            j--;
        }
    }
}

//Selection Sort finds the smallest value in the unsorted list with each pass, then swaps it into the correct position
//the outer for loop keeps track of the position to swap into, while the inner loop finds the smallest value
void selectionSort(vector<int>& num){
    int aux;
    for (int c = 0; c<num.size(); c++)  //c=position to swap into
    {
        for (int j=c; j<num.size(); j++)
        {
            aux=-1;
            if (num[j]<num[c]) {aux = j;}; //aux keeps track of the position of the smallest value
            if (aux!=-1){
                swap(num[aux],num[c]);
            } //does not swap if no smaller value was found
        }
    }
}